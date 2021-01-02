import { Configuration } from "../configuration/configuration";
import { Logger } from "../log/logger";
import express, { IRoute, Express } from 'express'
// import { ParamsDictionary, Query } from "express-serve-static-core";
import bodyParser from 'body-parser'
import { RequestHandler } from "express-serve-static-core"
import { Server } from "http";


export interface APIFactory 
{
    api(conf: Configuration, logger: Logger) : API
}

export interface API 
{
    use(middleware : any) : API
    route(path : string) : APIRoute
    run() : Server
}

export interface APIRoute 
{
    all(...handlers: RequestHandler[]): APIRoute
    post(...handlers: RequestHandler[]): APIRoute
    put(...handlers: RequestHandler[]): APIRoute 
    delete(...handlers: RequestHandler[]): APIRoute 
    patch(...handlers: RequestHandler[]): APIRoute 
    options(...handlers: RequestHandler[]): APIRoute 
    head(...handlers: RequestHandler[]): APIRoute 
    get(...handlers: RequestHandler[]): APIRoute 
}

export class MSWAPIFactory implements APIFactory 
{
    api(conf: Configuration, logger: Logger) : API
    {
        return new MSWAPI(conf, logger)
    }
}

export class MSWAPI implements API 
{
    server : Express
    config: Configuration
    logger : Logger
    constructor(conf: Configuration, logger: Logger) {
        this.server = express()
        this.config = conf
        this.logger = logger

        // body param parser
        this.server.use(bodyParser.urlencoded({ extended: false }))
        this.server.use(bodyParser.json())
        this.server.use((req, res, next) => {
            res.contentType('application/json')
            this.logger.traceDeferred(() => '\n    [REQUEST OBJECT]\n' 
                + '\t{\n\t' + JSON.stringify(req.params) + ','
                + '\n\t\t' + JSON.stringify(req.body) + ','
                + '\n\t\t' + JSON.stringify(req.query)
                + '\n\t}\n    [REQUEST OBJECT END]\n')

            try 
            {
                next()
            }
            catch (e)
            {
                if (e.code) 
                {
                    this.logger.debug(`Failing with error code ${e.code} - ${e.message}`)
                    res.status(e.code).json(e)
                }
                else
                {
                    this.logger.debug(`Failing with error code 500 - Unknown error`)
                    res.sendStatus(500)
                }
            }
            finally
            {
                this.logger.traceDeferred(() => '\n    [RESPONSE OBJECT]\n' 
                    + '\t{\n\t' + JSON.stringify(res.statusCode)
                    + '\n\t\t' + JSON.stringify(res.statusMessage)
                    + '\n\t\t' + JSON.stringify(res.getHeaders)
                    + '\n\t}\n    [RESPONSE OBJECT END]\n')
            }
        })
    }

    use(middleware: any) : API {
        this.server.use(middleware)
        return this
    }

    route(path: string) {
        return new MSWRoute(path, this.server, this.logger)
    }

    run() : Server {
        // rest of the code remains same
        if (!this.config.server.hostname)
            this.config.server.hostname = 'localhost'

        return this.server.listen(this.config.server.httpport, this.config.server.hostname, () => {
            this.logger.info(`⚡️ [server]: Server now is ⚡️ running ⚡️ at https://${this.config.server.hostname}:${this.config.server.httpport}`);
        })
    }
    
}

/**
 * Wrapper for Express IRoute to eventually intercept method's 
 * call has needed and simplify route implementation
 */
export class MSWRoute implements APIRoute
{
    route: IRoute
    logger: Logger
    // Request<ParamsDictionary, any, any, QueryString.ParsedQs>
    constructor(path: string, server: Express, logger: Logger) {
        this.logger = logger
        this.route = server.route(path)
    }

    all(...handlers: RequestHandler[]): APIRoute 
    {
        this.logger.info(`Adding route handler 'ALL' for '${this.route.path}'`)
        this.route = this.route.all(intercept(handlers))
        return this
    }
    
    post(...handlers: RequestHandler[]): APIRoute 
    {
        this.logger.info(`Adding route handler 'POST' for '${this.route.path}'`)
        this.route = this.route.post(intercept(handlers))
        return this
    }
    
    put(...handlers: RequestHandler[]): APIRoute 
    {
        this.logger.info(`Adding route handler 'PUT' for '${this.route.path}'`)
        this.route = this.route.put(intercept(handlers))
        return this
    }
    
    delete(...handlers: RequestHandler[]): APIRoute 
    {
        this.logger.info(`Adding route handler 'DELETE' for '${this.route.path}'`)
        this.route = this.route.delete(intercept(handlers))
        return this
    }
    
    patch(...handlers: RequestHandler[]): APIRoute 
    {
        this.logger.info(`Adding route handler 'PATCH' for '${this.route.path}'`)
        this.route = this.route.patch(intercept(handlers))
        return this
    }
    
    options(...handlers: RequestHandler[]): APIRoute 
    {
        this.logger.info(`Adding route handler 'OPTION' for '${this.route.path}'`)
        this.route = this.route.options(intercept(handlers))
        return this
    }

    head(...handlers: RequestHandler[]): APIRoute 
    {
        this.logger.info(`Adding route handler 'HEAD' for '${this.route.path}'`)
        this.route = this.route.head(intercept(handlers))
        return this
    }

    get(...handlers: RequestHandler[]): APIRoute 
    {
        this.logger.info(`Adding route handler 'GET' for '${this.route.path}'`)
        this.route = this.route.get(intercept(handlers))
        return this
    }
    
}

function intercept(handlers : RequestHandler[])
{
    return handlers.map(_intercept)
}

function _intercept(func : Function)
{
    return (req: any, res: any, next: any) => {
        console.log(`INTERCEPTED req.activeTx?.timeoutSent '${req.mswTx?.timeoutSent}'`)
        if (!req.mswTx?.timeoutSent)
        {
            func(req, res, next)
        }
    }
}
