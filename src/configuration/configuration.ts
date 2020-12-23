

export interface Configuration {
    node : {
        environment: string
    }

    database: {
        host: string,
        database: string,
        user: string,
        password: string,
        port: number
    }
    
    server: {
        httpport: number
        ip: number
    }
    
    batchService:  {
        baseDir: string,
        scanInterval_ms: number,
        namePattern: string
    }
    
    log: LogConfig
}

export interface LogConfig {
    isDebug: boolean
    isTrace: boolean
    isWarn: boolean
    isLocalOnly: boolean
}

/*
{
    "node" : {
        "environment": 'Development'
    },
    "database": {
        "host": "localhost",
        "database": "production_dev",
        "user": "appuser",
        "password": "aaa",
        "port": 5432
    },
    "server": {
        "httpport": 9080
    },
    "batchService":  {
        "baseDir":"./test-files/",
        "scanInterval": 600000
    }
    "log": {
        isDebug: true
        isTrace: false
        isWarn: true
        isLocalOnly: true
    }
}
 */