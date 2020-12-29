import { LogConfig } from "../configuration/configuration";
import debug from 'debug'

export interface Logger {
    info(formatter: string, args? : any[]) : void
    warn(formatter: string, args? : any[]) : void
    debug(formatter: string, args? : any[]) : void
    trace(formatter: string, args? : any[]) : void
    traceDeferred(callback: () => string) : void
}

export class MSWLogger implements Logger{
    logger
    namespace : string
    config : LogConfig
    constructor(namespace: string, conf? : LogConfig) {
        this.namespace = namespace
        // this.logger = debug(namespace)
        this.logger = console
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
        this.namespace = namespace
        return this
    }

    async info(formatter: string, args? : any[]) {
        this.logger.log(formatter, args)
    }
    
    async warn(formatter: string, args? : any[]) {
        if (this.config.isWarn || this.config.isDebug || this.config.isTrace)
        {
            this.logger.log(`[${this.namespace}:Warn@${this.timestamp()}] ${formatter}`, args)
        }
    }

    async debug(formatter: string, args? : any[]) {
        if (this.config.isDebug || this.config.isTrace)
        {
            this.logger.log(`[${this.namespace}:Debug@${this.timestamp()}] ${formatter}`, args)
        }
    }

    async trace(formatter: string, args? : any[]) {
        if (this.config.isTrace)
        {
            this.logger.log(`[${this.namespace}:Trace@${this.timestamp()}] ${formatter}`, args)
        }
    }

    async traceDeferred(callback: () => string) {
        if (this.config.isTrace)
        {
            this.logger.log(`[${this.namespace}:Trace@${this.timestamp()}] ${callback()}`)
        }
    }

    timestamp() {
        const timestamp = new Date()
        return String(timestamp.getFullYear()) + '-' 
            + String(timestamp.getMonth()+1).padStart(2, '0') + '-' 
            + String(timestamp.getDate()).padStart(2, '0') + 'T' 
            + String(timestamp.getMinutes()).padStart(2, '0') + ':' 
            + String(timestamp.getSeconds()).padStart(2, '0') + '.'
            + String(timestamp.getMilliseconds()).padStart(3, '0')
    }
}