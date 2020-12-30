import nconf from 'nconf'
import { Configuration } from './configuration/configuration'
import { API } from './api/api'
import { Logger, MSWLogger } from './log/logger'
import { transaction } from './transaction/transaction'

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
  logger(namespace: string) : Logger
  run() : void
}

export class MSWService implements Service {

  config : Configuration
  server : API
  NODE_ENV : string

  constructor(conf: Configuration, logger?: any) {
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

    this.server = new API(this.config, this.logger('microsware-api'))
    //TODO: get a way of setting a new transaction
    this.server.use(transaction(conf, this.logger('microsware-tx')))
    //TODO: configure serve to:
    //this.server.use > auth > transaction
    // TODO: treat authorization (needs paths )
    // this.server.use(authorization)
      //TODO: log
      //TODO: 

    

    // TODO: use configuration
    // TODO: add sanity routes
  }

  api() : API {
    return this.server
  }

  async initBatch(worker : () => void) {
    // TODO: initialize batch service 
    // TODO: add to interface
  }

  logger(namespace: string) : Logger {
    return new MSWLogger(namespace, this.config.log)
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
  listen() {
    // TODO: register event listenner 
  }

  get() {
    //TODO: treat transation
    //TODO: get from cache if cacheable
    //TODO: get from datasource
    //TODO: update cache if cacheable
    //TODO: log and update sanity status
  }

  send() {
    //TODO: treat transation
    //TODO: send event
    //TODO: should event be a property?
    //TODO: return observable or promise
    //TODO: log and update sanity status
  }

  run() {
    this.server.run()
  }
}