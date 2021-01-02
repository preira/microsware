
// import { promiseRequest } from '../js-common/fetch-utils'
import { Logger } from '../log/logger'
import { Request } from 'node-fetch'
import { Agent } from 'http'

export interface FetchFactory 
{
    fetch(logger : Logger, headers? : {key:string, value:string}[]) : Fetch
}

export interface Fetch 
{
    get(url : string) : Promise<Body>
    post(url : string, content : JSON | string) : Promise<Body>
}

export class MSWFetchFactory implements FetchFactory 
{
    fetch(logger : Logger, headers? : {key:string, value:string}[]) : Fetch
    {
        return new MSWFetch(logger, headers)
    }
}

export class MSWFetch implements Fetch {

    private headers : {[k: string]: any} = {
        'Content-Type': 'application/json'
    }
    logger : Logger
    // request : Function

    constructor(logger : Logger, headers? : {[k: string]: any})
    {
        this.logger = logger
        this.logger.traceDeferred(()=>`Building FETCH with headers : '${headers}'`)
        if (headers)
        {
            for(let prop : string in headers)
            {
                this.headers[prop] = headers[prop]
                this.headers.set(item.key, item.value)
            })
        }
        // this.request = promiseRequest(logger)
    }

    async get(url : string) : Promise<Body>
    {
        this.logger.traceDeferred(()=>`GET : '${url}'`)
        try 
        {
            const options : Options = {
                method : 'GET',
                // url : url,
                headers: this.headers,
                json: true
            }
            const res :  {code : number, body : Body} = await this.request(url, options)
            // TODO: what if error code
            return res.body
        }
        catch(e)
        {
            // TODO: what if there is an error
            throw e
        }
    }

    async post(url : string, content : JSON | string) : Promise<Body>
    {
        this.logger.traceDeferred(()=>`POST : '${url}'`)
        const options : Options = {
            method : 'POST',
            // url : url,
            body : content,
            headers: this.headers,
            json: true
        }
        const res :  {code : number, body : Body} = await this.request(url, options)
        // TODO: what if error code
        return res.body

    }

    request(url : string, options : Options) {
        
        const rq = new Request(url, options)
        return (options) => {
            return new Promise((resolve, reject) => {
                request(options, (err, resp, body) => {
                    logger.traceDeferred('RESPONSE {\'err\':%o, \'statusCode\':%o, \'body\':%o}', 
                    err, resp && resp.statusCode, body && '{...obj...}' || 'empty')// && body.length)
    
                    let statusCode = err && 500 || resp.statusCode
                    let errCode = 500
                    switch (statusCode) {
                        case 200 :
                        case 201 :
                            //If no valid results, change status code to 404 not found
                            statusCode = body && statusCode || 404
                            resolve({code:statusCode, body:body})
                            break
                        case 401 :
                        case 403 :
                        case 404 :
                            errCode = statusCode
                        default :
                            logger.error(`Failing due to response code '${resp && resp.statusCode}' or err '${err}'`)
                            err = err || new Error(`Failing due to response code '${resp && resp.statusCode}' or err '${err}'`)
                            err.code = errCode
                            reject(err)
                            break
                    }
                })
            })
        }
    }
}

interface Options {
    // These properties are part of the Fetch Standard
    method: string      // http method
    headers: { string: string}         // request headers. format is the identical to that accepted by the Headers constructor (see below)
    body: any           // request body. can be null, a string, a Buffer, a Blob, or a Node.js Readable stream
    redirect: 'follow'| 'manual'| 'error'    // 'follow', set to `manual` to extract redirect headers, `error` to reject redirect
    signal: any         // pass an instance of AbortSignal to optionally abort requests
 
    // The following properties are node-fetch extensions
    follow: number         // maximum redirect count. 0 to not follow redirect
    timeout: number         // req/res timeout in ms, it resets on redirect. 0 to disable (OS limit applies). Signal is recommended instead.
    compress: boolean,     // support gzip/deflate content encoding. false to disable
    size: number,            // maximum response body size in bytes. 0 to disable
    agent: Agent | ((parsedUrl: URL) => Agent) | undefined         // http(s).Agent instance or function that returns an instance (see documentation)
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