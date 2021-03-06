import { LogConfig } from "../configuration/configuration";

export interface Logger {
    info(formatter: string, args? : any[]) : void
    error(formatter: string, args? : any[]) : void
    warn(formatter: string, args? : any[]) : void
    debug(formatter: string, args? : any[]) : void
    trace(formatter: string, args? : any[]) : void
    traceDeferred(callback: () => string) : void
}

export interface LoggerFactory {
    logger(namespace : string, conf? : LogConfig) : Logger
}

export class MSWLoggerFactory implements LoggerFactory {

    logger(namespace : string, conf? : LogConfig) : Logger 
    { 
        return new MSWLogger(namespace, conf) 
    }
}

export class MSWLogger implements Logger{
    logger : Console
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
        this.log(`[${this.namespace}:Info@${this.timestamp()}] ${formatter}`, args)
    }
    
    async error(formatter: string, args? : any[]) {
        this.log(`[${this.namespace}:Error@${this.timestamp()}] ${formatter}`, args)
    }
    
    async warn(formatter: string, args? : any[]) {
        if (this.config.isWarn || this.config.isDebug || this.config.isTrace)
        {
            this.log(`[${this.namespace}:Warn@${this.timestamp()}] ${formatter}`, args)
        }
    }

    async debug(formatter: string, args? : any[]) {
        if (this.config.isDebug || this.config.isTrace)
        {
            this.log(`[${this.namespace}:Debug@${this.timestamp()}] ${formatter}`, args)
        }
    }

    async trace(formatter: string, args? : any[]) {
        if (this.config.isTrace)
        {
            this.log(`[${this.namespace}:Trace@${this.timestamp()}] ${formatter}`, args)
        }
    }

    async traceDeferred(callback: () => string) {
        if (this.config.isTrace)
        {
            this.log(`[${this.namespace}:Trace@${this.timestamp()}] ${callback()}`)
        }
    }

    private log(formatter: string, args? : any[]) {
        // this.logger(formatter, args)
        if (args)
        {
            this.logger.log(formatter, args)
        }
        else 
        {
            this.logger.log(formatter)
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