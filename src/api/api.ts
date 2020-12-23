import { Configuration } from "../configuration/configuration";
import { Logger } from "../log/logger";
import express, { IRoute, Express } from 'express'
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
        return new MSWRoute(path, this.server)
    }

    run() {
        // rest of the code remains same
        this.server.listen(this.config.server.httpport, () => {
          console.log(`⚡️[server]: Server now is running at https://${this.config.server.ip}:${this.config.server.httpport}`);
        })
      }
    
}

/**
 * Wrapper for Express IRoute to eventually intercept method's call has needed
 */
export class MSWRoute {
    route: IRoute
    constructor(path: string, server: Express) {
        this.route = server.route(path)
    }

    all(req : any, res : any, next : any): IRoute {
        return this.route.all(req, res, next)
    }
    
    get(req : any, res : any, next : any): IRoute {
        return this.route.all(req, res, next)
    }
    
    post(req : any, res : any, next : any): IRoute {
        return this.route.all(req, res, next)
    }
    
    put(req : any, res : any, next : any): IRoute {
        return this.route.all(req, res, next)
    }
    
    delete(req : any, res : any, next : any): IRoute {
        return this.route.all(req, res, next)
    }
    
    patch(req : any, res : any, next : any): IRoute {
        return this.route.all(req, res, next)
    }
    
    options(req : any, res : any, next : any): IRoute {
        return this.route.all(req, res, next)
    }

    head(req : any, res : any, next : any): IRoute {
        return this.route.all(req, res, next)
    }
}