import { Configuration } from "../configuration/configuration";
import { Logger } from "../log/logger";
import express, { IRoute, Express } from 'express'
// import { ParamsDictionary, Query } from "express-serve-static-core";
import bodyParser from 'body-parser'
import { RequestHandler } from "express-serve-static-core";


export class API {
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
            this.logger.traceDeferred(() => '\n[REQUEST OBJECT]\n' 
                + '\t{\n\t' + JSON.stringify(req.params) + ','
                + '\n\t\t' + JSON.stringify(req.body) + ','
                + '\n\t\t' + JSON.stringify(req.query)
                + '\n\t}\n[REQUEST OBJECT END]\n')
            next()
            this.logger.traceDeferred(() => '\n[RESPONSE OBJECT]\n' 
                + '\t{\n\t' + JSON.stringify(res.req?.params)
                + '\n\t\t' + JSON.stringify(res.req?.body)
                + '\n\t\t' + JSON.stringify(res.req?.query)
                + '\n\t}\n[RESPONSE OBJECT END]\n')
        })
    }

    use(middleware: any) {
        this.server.use(middleware)
    }

    route(path: string) {
        return new MSWRoute(path, this.server, this.logger)
    }

    run() {
        // rest of the code remains same
        if (!this.config.server.hostname)
            this.config.server.hostname = 'localhost'

        this.server.listen(this.config.server.httpport, this.config.server.hostname, () => {
            this.logger.info(`⚡️[server]: Server now is running at https://${this.config.server.hostname}:${this.config.server.httpport}`);
        })
      }
    
}

/**
 * Wrapper for Express IRoute to eventually intercept method's 
 * call has needed and simplify route implementation
 */
export class MSWRoute {
    route: IRoute
    logger: Logger
    // Request<ParamsDictionary, any, any, QueryString.ParsedQs>
    constructor(path: string, server: Express, logger: Logger) {
        this.logger = logger
        this.route = server.route(path)
    }

    all(...handlers: RequestHandler[]): MSWRoute {
        this.logger.info(`Adding route handler 'ALL' for '${this.route.path}'`)
        this.route = this.route.all(handlers)
        return this
    }
    
    get(...handlers: RequestHandler[]): MSWRoute {
        this.logger.info(`Adding route handler 'GET' for '${this.route.path}'`)
        this.route = this.route.get(handlers)
        return this
    }
    
    post(...handlers: RequestHandler[]): MSWRoute {
        this.logger.info(`Adding route handler 'POST' for '${this.route.path}'`)
        this.route = this.route.post(handlers)
        return this
    }
    
    put(...handlers: RequestHandler[]): MSWRoute {
        this.logger.info(`Adding route handler 'PUT' for '${this.route.path}'`)
        this.route = this.route.put(handlers)
        return this
    }
    
    delete(...handlers: RequestHandler[]): MSWRoute {
        this.logger.info(`Adding route handler 'DELETE' for '${this.route.path}'`)
        this.route = this.route.delete(handlers)
        return this
    }
    
    patch(...handlers: RequestHandler[]): MSWRoute {
        this.logger.info(`Adding route handler 'PATCH' for '${this.route.path}'`)
        this.route = this.route.patch(handlers)
        return this
    }
    
    options(...handlers: RequestHandler[]): MSWRoute {
        this.logger.info(`Adding route handler 'OPTION' for '${this.route.path}'`)
        this.route = this.route.options(handlers)
        return this
    }

    head(...handlers: RequestHandler[]): MSWRoute {
        this.logger.info(`Adding route handler 'HEAD' for '${this.route.path}'`)
        this.route = this.route.head(handlers)
        return this
    }
}