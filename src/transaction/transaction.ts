import { Configuration } from "../configuration/configuration"
import { TimeoutError } from "../exception/exception"
import { wrap } from '../js-common/express-overload'
import { Logger } from "../log/logger"

export const DEFAULT_TX_TIMEOUT = 5*60*1000
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
export interface Transaction 
{
    availableTimeout() : number
    getRequestHeader() : {[k: string]: any}
    printTimeoutMsg() : string
}

export interface TransactionFactory 
{
    defaultTxObject(conf : Configuration, timestamp : Date, timeout : number) : TransactionObject
    transaction(conf : Configuration, logger: Logger) : (req: any, res: any, next: any) => void
}

export class MSWTransactionFactory implements TransactionFactory
{
    defaultTxObject(conf : Configuration, timestamp : Date, timeout : number) : TransactionObject
    {
        return MSWTransactionFactory._defaultTxObject(conf, timestamp, timeout)
    }

    transaction(conf : Configuration, logger: Logger) : (req: any, res: any, next: any) => void
    {
        return transaction(conf, logger)
    }

    static _defaultTxObject(conf : Configuration, timestamp : Date, timeout : number = DEFAULT_TX_TIMEOUT) : TransactionObject
    {
        return {
            sender: `${conf.service.name}-${conf.service.uuid}`,
            receiver: `${conf.service.name}-${conf.service.uuid}`,
            startTime: date2string(timestamp),
            availableTimeout : timeout
        }

    }
}

export class MSWTransaction {
    private originalTimeout : number
    tx : TransactionObject
    receptionTimestamp : Date
    timeoutSent : boolean = false
    static HEADER_FIELD_NAME : string = 'MSWTransaction'

    constructor(obj : TransactionObject) {
        this.originalTimeout = obj.availableTimeout
        this.tx = obj
        this.receptionTimestamp = new Date()
        this.tx.receivedAt = date2string(this.receptionTimestamp)
    }

    availableTimeout(date : Date = new Date()) : number {
        const available = this.tx.availableTimeout 
            + this.receptionTimestamp.getTime() 
            - date.getTime()
        if (available < 0) return 0 //throw new TimeoutError(this.printTimeoutMsg(this.tx, new Date()))
        return available
    }

    printTimeoutMsg(timestamp : Date = new Date()) {
        return `Transaction received from ${this.tx.sender} ` + 
            `at ${this.tx.receivedAt} with initial timeout of ` +
            `${this.originalTimeout} has timed out after ` +
            `${timestamp.getTime()-this.receptionTimestamp.getTime()}`
    }

    getTx2Request(to?: string) : TransactionObject{
        const timestamp = new Date()
        return {
            sender: this.tx.receiver,
            receiver: to || '',
            startTime: this.tx.startTime,
            receivedAt: '',
            respondedAt: '',
            sentAt: date2string(timestamp),
            availableTimeout: this.availableTimeout(timestamp),
        }
    }

    getTx2Respond() : TransactionObject{
        const timestamp = new Date()
        
        this.tx.availableTimeout = this.availableTimeout(timestamp)
        this.tx.respondedAt = date2string(timestamp)
        return this.tx
    }

    getRequestHeader() : {[k: string]: any}
    {
        const header : {[k: string]: any} = {}
        header[MSWTransaction.HEADER_FIELD_NAME] = JSON.stringify(this.getTx2Request())
        return header
    }

}

function date2string(date : Date) : string {
    return date.getFullYear() + '-' +
        pad(date.getMonth()+1, 2) + '-' + 
        pad(date.getDate()+1, 2) + 'T' + 
        pad(date.getHours()+1, 2) + ':' + 
        pad(date.getMinutes()+1, 2) + ':' + 
        pad(date.getSeconds()+1, 2) + '.' + 
        pad(date.getMilliseconds()+1, 2)
}



export interface TransactionObject {
    /** Who sent the message */
    sender : string
    /** Who is the message meant to  */
    receiver : string
    /** Timestamp when transaction was created */
    startTime : string
    /** receiver has received at this timestamp */
    receivedAt? : string
    /** receiver has responded at this timestamp */
    respondedAt? : string
    /** sender has send at this timestamp */
    sentAt? : string
    /** remaining timeout */
    availableTimeout : number
}

function pad(n : number, digits : number) : string {
    return String(n).padStart(digits, '0')
}

export function transaction(conf : Configuration, logger: Logger){
    return (req : any, res : any, next : any)  => {
        const timestamp = new Date()
        let tx : TransactionObject
        const timeout = conf.transaction?.timeout || DEFAULT_TX_TIMEOUT

        const mswTxHeader = req.header(MSWTransaction.HEADER_FIELD_NAME)
        if (mswTxHeader)
        {
            tx = JSON.parse(mswTxHeader)
        }
        else if (!conf.transaction) 
        {
            // No transaction is expected
            next()
            return
        }
        else
        {
            tx = MSWTransactionFactory._defaultTxObject(conf, timestamp, timeout)
            // tx = {
            //     sender: `${conf.service.name}-${conf.service.uuid}`,
            //     receiver: `${conf.service.name}-${conf.service.uuid}`,
            //     startTime: date2string(timestamp),
            //     availableTimeout : timeout
            // }
        }

        const mswTx = new MSWTransaction(tx)
        req.mswTx = mswTx
    
        res.end = wrap(
            res.end, 
            (...args : any[]) => {
                // don't add to response if it wasn't present in the request - mswTxHeader 
                if (mswTxHeader && !res.writableEnded && !res.writableFinished)
                {
                    const txStr = JSON.stringify(mswTx.getTx2Respond())
                    res.setHeader(MSWTransaction.HEADER_FIELD_NAME, txStr)
                    logger.traceDeferred(() => `Writing transation to header ${txStr}`)
                }
            })

        res.json = wrap(
            res.json, 
            (...args : any[]) => {
                if (mswTx.timeoutSent)
                {
                    throw new TimeoutError(mswTx.printTimeoutMsg())
                }
            },
            undefined,
            (err : TimeoutError) => {
                if (err.code == 504)
                {
                    logger.traceDeferred(() => `App tried to respond after timeout`)
                    return res
                }
                else
                {
                    throw err
                }
            })

        res.send = wrap(
            res.send, 
            (...args : any[]) => {
                if (mswTx.timeoutSent)
                {
                    throw new TimeoutError(mswTx.printTimeoutMsg())
                }
            },
            undefined,
            (err : TimeoutError) => {
                if (err.code == 504)
                {
                    logger.traceDeferred(() => `App tried to respond after timeout`)
                    return res
                }
                else
                {
                    throw err
                }
            })

        setTimeout(() => {
            if(!res.writableEnded)
            {
                res.status(504).send('Transaction timed out')
                logger.error(mswTx.printTimeoutMsg())
                mswTx.timeoutSent = true
            }
        }, mswTx.availableTimeout())

        next()
    }
}
