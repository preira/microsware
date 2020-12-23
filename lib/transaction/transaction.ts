import { TimeoutError } from "../exception/exception"

/**
 * A MSW Transaction is a series of service calls and 
 * corresponding responses.
 * 
 * Management od MSW transactions involve:
 * + timeout control - each call piggy backs the time still 
 *   available to complete the transaction.
 * the MSW transaction is passed in the request's and response's header mswTransaction
 * 
 * MSW Transanction is available on the request
 *     req.mswTx = mswTx
 * 
 * 
 * TODO: transactional control and distributed transactions
 * 
 * TransationObject should go in the request and response header
 */
export interface Transaction {
}

export class MSWTransation {
    
    tx : TransactionObject
    receptionTimestamp : Date

    constructor(obj : TransactionObject) {
        this.tx = obj
        this.receptionTimestamp = new Date()
        this.tx.receivedAt = this.date2string(this.receptionTimestamp)
    }

    availableTimeout(date : Date = new Date()) : number {
        const available = this.tx.availableTimeout 
            + this.receptionTimestamp.getTime() 
            - new Date().getTime()
        if (available < 0) throw new TimeoutError(this.printTimeoutMsg(this.tx, new Date()))
        return available
    }

    date2string(date : Date) : string {
        return date.getFullYear + '-' +
            pad(date.getMonth()+1, 2) + '-' + 
            pad(date.getDate()+1, 2) + 'T' + 
            pad(date.getHours()+1, 2) + ':' + 
            pad(date.getMinutes()+1, 2) + ':' + 
            pad(date.getSeconds()+1, 2) + '.' + 
            pad(date.getMilliseconds()+1, 2)
    }

    printTimeoutMsg(tx : TransactionObject, timestamp : Date) {
        return `Transaction received from ${tx.sender} ` + 
            `at ${tx.receivedAt} with initial timeout of ` +
            `${tx.availableTimeout} has timed out after ` +
            `${timestamp.getTime()-this.receptionTimestamp.getTime()}`
    }

    getTx2Request(to: string) : TransactionObject{
        const timestamp = new Date()
        return {
            sender: this.tx.receiver,
            receiver: to,
            startTime: this.tx.startTime,
            receivedAt: '',
            respondedAt: '',
            sentAt: this.date2string(timestamp),
            availableTimeout: this.availableTimeout(timestamp),
        }
    }

    getTx2Respond() : TransactionObject{
        const timestamp = new Date()
        
        this.tx.availableTimeout = this.availableTimeout(timestamp)
        this.tx.respondedAt = this.date2string(timestamp)
        return this.tx
    }

}

export interface TransactionObject {
    /** Who sent the message */
    sender : string
    /** Who is the message meant to  */
    receiver : string
    /** Timestamp when transaction was created */
    startTime : string
    /** receiver has received at this timestamp */
    receivedAt : string
    /** receiver has responded at this timestamp */
    respondedAt : string
    /** sender has send at this timestamp */
    sentAt : string
    /** remaining timeout */
    availableTimeout : number
}

function pad(n : number, digits : number) : string {
    return String(n).padStart(digits, '0')
}

export function transaction(req : any, res : any, next : any) {
    const tx : TransactionObject = req.header.mswtransaction
    const mswTx = new MSWTransation(tx)
    
    req.mswTx = mswTx

    next()

    //TODO: set transaction in response header
    res.header.mswtransaction = mswTx.getTx2Respond()
}
