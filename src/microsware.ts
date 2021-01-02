import nconf from 'nconf'
import { Configuration } from './configuration/configuration'
import { API, APIFactory, MSWAPIFactory } from './api/api'
import { Logger, LoggerFactory, MSWLoggerFactory } from './log/logger'
import { transaction } from './transaction/transaction'
import { Fetch, FetchFactory, MSWFetchFactory } from './fetch/fetch'
import { Server } from 'http'

/* TODO: 
  consider to export an interface as a contract for
  building a service in three layers:
    + api
    + business
    + data access

  Organise error handling here!
*/
export interface Service {
  api() : API
  fetch() : Fetch
  logger(namespace: string) : Logger
  run() : Server
}

export class MSWService implements Service {

  config : Configuration
  server : API
  NODE_ENV : string
  private _logger : Logger
  private loggerFactory : LoggerFactory
  private fetchFactory : FetchFactory

  constructor(conf: Configuration, 
    apiFactory? : APIFactory, 
    fetchFactory? : FetchFactory, 
    loggerFactory?: LoggerFactory) 
  {
    this.config = conf
    // Read configurations
    if (conf && conf.node && conf.node.environment)
    {
      this.NODE_ENV = conf.node.environment
    }
    else
    {
      nconf.argv().env().defaults({'NODE_ENV': 'development'})

      this.NODE_ENV = nconf.get('NODE_ENV').toLowerCase()
      process.title = `${this.NODE_ENV}`.toUpperCase()
    }

    if (loggerFactory)
    {
      this.loggerFactory = loggerFactory
    }
    else
    {
      this.loggerFactory = new MSWLoggerFactory()
    }
    this._logger = this.logger('microsware-core')

    if (apiFactory)
    {
      this.server = apiFactory.api(this.config, this.logger('microsware-api'))
    }
    else
    {
      this.server = new MSWAPIFactory().api(this.config, this.logger('microsware-api'))
    }
    
    this.server.use(transaction(conf, this.logger('microsware-tx')))

    if (fetchFactory)
    {
      this.fetchFactory = fetchFactory
    }
    else
    {
      this.fetchFactory = new MSWFetchFactory()
    }
    
    //TODO: configure serve to:
    //this.server.use > auth > transaction
    // TODO: treat authorization (needs paths )
    // this.server.use(authorization)    

    // TODO: use configuration
      // TODO: add sanity routes
  }

  api() : API 
  {
    return this.server
  }

  async initBatch(worker : () => void) 
  {
    // TODO: initialize batch service 
    // TODO: add to interface
  }

  logger(namespace: string) : Logger 
  {
    return this.loggerFactory.logger(namespace, this.config.log)
  }

  fetch(headers? : {key:string, value:string}[]) : Fetch {
    // TODO: cache fetch object for different targets
    // TODO: configure from configuration object
    this._logger.traceDeferred(()=>`FETCH : '${headers}'`)

    return this.fetchFactory.fetch(this.logger('microsware-fetch'), headers)
  }

  /*
    event.listen
    event.send
    db.insert
    db.read
    db.udpate

    use local cache
    use remote cache
  */
  listen(to : string) {
    // TODO: register event listenner 
  }

  send() {
    //TODO: treat transation
    //TODO: send event
    //TODO: should event be a property?
    //TODO: return observable or promise
    //TODO: log and update sanity status
  }

  run() : Server {
    return this.server.run()
  }
}