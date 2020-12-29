import { Configuration } from "../configuration/configuration";
import { Logger } from "../log/logger";
import express, { IRoute, Express, RequestHandler } from 'express'
import bodyParser from 'body-parser'


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
            this.logger.trace('\n[REQUEST OBJECT]\n' 
                + JSON.stringify(req)
                + '\n[REQUEST OBJECT END]\n')
                next()
                this.logger.trace('\n[RESPONSE OBJECT]\n' 
                + JSON.stringify(res)
                + '\n[RESPONSE OBJECT END]\n')
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
        this.server.listen(this.config.server.httpport, () => {
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
    
    constructor(path: string, server: Express, logger: Logger) {
        this.logger = logger
        this.route = server.route(path)
    }

    all(...handlers: RequestHandler<any, any, any, any>[]): MSWRoute {
        this.logger.info(`Adding route handler 'ALL' for '${this.route.path}'`)
        this.route = this.route.all(handlers)
        return this
    }
    
    get(...handlers: RequestHandler<any, any, any, any>[]): MSWRoute {
        this.logger.info(`Adding route handler 'GET' for '${this.route.path}'`)
        this.route = this.route.get(handlers)
        return this
    }
    
    post(...handlers: RequestHandler<any, any, any, any>[]): MSWRoute {
        this.logger.info(`Adding route handler 'POST' for '${this.route.path}'`)
        this.route = this.route.post(handlers)
        return this
    }
    
    put(...handlers: RequestHandler<any, any, any, any>[]): MSWRoute {
        this.logger.info(`Adding route handler 'PUT' for '${this.route.path}'`)
        this.route = this.route.put(handlers)
        return this
    }
    
    delete(...handlers: RequestHandler<any, any, any, any>[]): MSWRoute {
        this.logger.info(`Adding route handler 'DELETE' for '${this.route.path}'`)
        this.route = this.route.delete(handlers)
        return this
    }
    
    patch(...handlers: RequestHandler<any, any, any, any>[]): MSWRoute {
        this.logger.info(`Adding route handler 'PATCH' for '${this.route.path}'`)
        this.route = this.route.patch(handlers)
        return this
    }
    
    options(...handlers: RequestHandler<any, any, any, any>[]): MSWRoute {
        this.logger.info(`Adding route handler 'OPTION' for '${this.route.path}'`)
        this.route = this.route.options(handlers)
        return this
    }

    head(...handlers: RequestHandler<any, any, any, any>[]): MSWRoute {
        this.logger.info(`Adding route handler 'HEAD' for '${this.route.path}'`)
        this.route = this.route.head(handlers)
        return this
    }
}