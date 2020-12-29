/**
 * service - caracterizes the service
 *      uuid - should be unique per service instance
 * node - environment configuration
 * database - database connection configuration
 * server - web server configuration
 * batchService - if service includes batch job
 * 
 */

export interface Configuration {

    service : {
        name : string,
        version : string,
        uuid : string
    }

    node? : {
        environment : string
    }

    database? : {
        host : string,
        database : string,
        user : string,
        password : string,
        port : number
    }
    
    server : {
        httpport : number
        hostname? : number
    }
    
    batchService? :  {
        baseDir : string,
        scanInterval_ms : number,
        namePattern : string
    }

    transaction? : TransactionConfig
    
    log? : LogConfig
}

export interface TransactionConfig {
    timeout : number
}

export interface LogConfig {
    isDebug? : boolean
    isTrace? : boolean
    isWarn? : boolean
    isLocalOnly? : boolean
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