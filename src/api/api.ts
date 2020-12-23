import { Configuration } from "../configuration/configuration";
import { Logger } from "../log/logger";
import express from 'express'
import { Express} from 'express'
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

    }
    
    use(middleware: any) {
        this.server.use(middleware)
    }
}