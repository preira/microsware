/** https://blog.logrocket.com/typescript-with-node-js-and-express/ **/
import express from 'express'
import nconf from 'nconf'
import { Configuration } from './configuration/configuration'
import { API } from './api/api'
import { Logger, MSWLogger } from './log/logger'

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
}

export class MSWService {

  config : Configuration
  server : API
  NODE_ENV

  constructor(conf: Configuration, logger: any) {
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
    //TODO: configure serve to:
      //TODO: treat authorization
      //TODO: treat transation
      //TODO: log
      //TODO: 

    

    // TODO: use configuration
    // TODO: add sanity routes
    // TODO: initialize batch service
  }

  api() : API {
    return this.server
  }

  logger(namespace: string) : Logger {
    return new MSWLogger(this.config.log).init(namespace)
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
    // rest of the code remains same
    const server = express()
    const PORT = 3000
    server.get('/', (req, res) => res.send('Express + TypeScript Server'));
    server.listen(PORT, () => {
      console.log(`⚡️[server]: Server now is running at https://localhost:${PORT}`);
    })
    server.get('/example', (req, res)=>res.json({name:"value"}))
  }
}