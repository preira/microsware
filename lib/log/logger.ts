import { LogConfig } from "../configuration/configuration";
import debug from 'debug'

export interface Logger {
    info(formatter: string, args? : any[]) : void
    warn(formatter: string, args? : any[]) : void
    debug(formatter: string, args? : any[]) : void
    trace(formatter: string, args? : any[]) : void
}

export class MSWLogger implements Logger{
    logger : any
    config : LogConfig
    constructor(namespace: string, conf? : LogConfig) {
        this.logger = debug(namespace)
        if (conf)
        {
            this.config = conf
        }
        else{
            this.config = {

            }
        }

        //TODO: allow injecting logger
        //TODO: add log to server (send event)
        //TODO: add log to file (get file location in config)
    }

    init(namespace: string) {
        this.logger = debug(namespace)
        return this
    }

    async info(formatter: string, args? : any[]) {
        this.logger(formatter, args)
    }
    
    async warn(formatter: string, args? : any[]) {
        if (this.config.isWarn || this.config.isDebug || this.config.isTrace)
        {
            this.logger(`[Warn@${this.timestamp()}] ${formatter}`, args)
        }
    }

    async debug(formatter: string, args? : any[]) {
        if (this.config.isDebug || this.config.isTrace)
        {
            this.logger(`[Debug@${this.timestamp()}] ${formatter}`, args)
        }
    }

    async trace(formatter: string, args? : any[]) {
        if (this.config.isTrace)
        {
            this.logger(`[Trace@${this.timestamp()}] ${formatter}`, args)
        }
    }

    timestamp() {
        const timestamp = new Date()
        return String(timestamp.getHours()).padStart(2, '0') + ':' 
            + String(timestamp.getMinutes()).padStart(2, '0') + ':' 
            + String(timestamp.getSeconds()).padStart(2, '0') + '.'
            + String(timestamp.getMilliseconds()).padStart(3, '0')
    }
}