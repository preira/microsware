
import { Options } from 'request'
import { promiseRequest } from '../js-common/fetch-utils'
import { Logger } from '../log/logger'

export class Fetch {

    private headers = new Headers({
        'Content-Type': 'application/json'
    })
    logger : Logger
    request : Function

    constructor(logger : Logger, headers? : {key:string, value:string}[])
    {
        headers?.forEach(item => {
            this.headers.set(item.key, item.value)
        })
        this.logger = logger
        this.request = promiseRequest(logger)
    }

    async get(url : string) 
    {
        const options : Options = {
            method : 'GET',
            url : url,
            headers: this.headers,
            json: true
        }
        const {code, body} = await this.request(options)
        // TODO: what if error code
        return body
    }

    async post(url : string, content : JSON | string)
    {
        const options : Options = {
            method : 'POST',
            url : url,
            body : content,
            headers: this.headers,
            json: true
        }
        const {code, body} = await this.request(options)
        // TODO: what if error code
        return body

    }
}


