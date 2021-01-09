
import { Logger } from '../log/logger'
import { Agent } from 'http'
import { HttpError } from '../exception/exception'

export interface RequestFactory 
{
    fetch(logger : Logger, headers? : {[k: string]: any}[]) : Request
}

export interface Request 
{
    addHeaders(headers? : {[k: string]: any}) : void
    get(url : string, timeout? : number) : Promise<Response>
    post(url : string, content : JSON | string, timeout? : number) : Promise<Response>
}

export class MSWRequestFactory implements RequestFactory 
{
    fetch(logger : Logger, headers? : {[k: string]: any}[]) : Request
    {
        return new MSWRequest(logger, headers)
    }
}

export class MSWRequest implements Request {

    private headers : {[k: string]: any} = {
        'Content-Type': 'application/json'
    }
    logger : Logger

    constructor(logger : Logger, headers? : {[k: string]: any})
    {
        this.logger = logger
        this.logger.traceDeferred(()=>`Building FETCH with headers : '${headers}'`)
        this.addHeaders(headers)
    }
    
    addHeaders(headers? : {[k: string]: any})
    {
        if (headers)
        {
            for(const prop in headers)
            {
                this.headers[prop] = headers[prop]
            }
        }
    }

    async get(url : string, timeout? : number) : Promise<Response>
    {
        this.logger.traceDeferred(()=>`GET : '${url}'`)
        try 
        {
            const options : Options = {
                method : 'GET',
                headers: this.headers,
                timeout: timeout || 0, // TODO: should default to configuration timeout before defaulting to OS
                json: true
            }
            const res : Response = await this._do(url, options)
            // TODO: what if error code
            return res
        }
        catch(e)
        {
            // TODO: what if there is an error
            throw e
        }
    }

    async post(url : string, content : JSON | string, timeout? : number) : Promise<Response>
    {
        this.logger.traceDeferred(()=>`POST : '${url}'`)
        const options : Options = {
            method : 'POST',
            body : content,
            timeout: timeout || 0, // TODO: should default to configuration timeout before defaulting to OS
            headers: this.headers,
            json: true
        }
        const res : Response = await this._do(url, options)
        // TODO: what if error code
        return res
    }

    async _do(url : string, options : Options) {
        try
        {
            const resp = await fetch(url, options)
            const body = await resp?.json()
            const headers = resp?.headers
            this.logger.traceDeferred(() => 
                `RESPONSE {\'statusCode\':${resp?.status}, \'body\':${body}}`)

            let statusCode = resp.status
            let errCode = 500
            switch (statusCode) {
                case 200 :
                case 201 :
                    //If no valid results, change status code to 404 not found
                    statusCode = body && statusCode || 404
                    return {code : statusCode, body : body, headers : headers}
                case 401 :
                case 403 :
                case 404 :
                    errCode = statusCode
                default :
                    this.logger.error(`Failing due to response code '${resp.status}'`)
                    const err = new HttpError(`Failing due to response code '${resp.status}'`)
                    err.code = errCode
                    throw err
                    // break
            }

        }
        catch (e)
        {
            // throw 500
            throw new HttpError(e.message)
        }
    }
}

export interface Response 
{
    code : number 
    body : Body
    headers : Headers
}

interface Options {
    // These properties are part of the Fetch Standard
    method: string      // http method
    headers?: {[k: string]: any}         // request headers. format is the identical to that accepted by the Headers constructor (see below)
    body?: any           // request body. can be null, a string, a Buffer, a Blob, or a Node.js Readable stream
    redirect?: 'follow'| 'manual'| 'error'    // 'follow', set to `manual` to extract redirect headers, `error` to reject redirect
    signal?: any         // pass an instance of AbortSignal to optionally abort requests
 
    // The following properties are node-fetch extensions
    follow?: number         // maximum redirect count. 0 to not follow redirect
    timeout?: number         // req/res timeout in ms, it resets on redirect. 0 to disable (OS limit applies). Signal is recommended instead.
    compress?: boolean     // support gzip/deflate content encoding. false to disable
    size?: number            // maximum response body size in bytes. 0 to disable
    agent?: Agent | ((parsedUrl: URL) => Agent)         // http(s).Agent instance or function that returns an instance (see documentation)

    // Custom properties
    json?: boolean
}

/*
{
    // These properties are part of the Fetch Standard
    method: 'GET',
    headers: {},        // request headers. format is the identical to that accepted by the Headers constructor (see below)
    body: null,         // request body. can be null, a string, a Buffer, a Blob, or a Node.js Readable stream
    redirect: 'follow', // set to `manual` to extract redirect headers, `error` to reject redirect
    signal: null,       // pass an instance of AbortSignal to optionally abort requests
 
    // The following properties are node-fetch extensions
    follow: 20,         // maximum redirect count. 0 to not follow redirect
    timeout: 0,         // req/res timeout in ms, it resets on redirect. 0 to disable (OS limit applies). Signal is recommended instead.
    compress: true,     // support gzip/deflate content encoding. false to disable
    size: 0,            // maximum response body size in bytes. 0 to disable
    agent: null         // http(s).Agent instance or function that returns an instance (see below)
}
*/