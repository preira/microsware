// use microsware has framework to share repetitive implementation

import { MSWService, Service } from '../lib/microsware'
// TODO:
// set up routes

const server : Service = new MSWService(
    { 
        service : {
            name : 'TemplateService',
            version : '0.0.1',
            uuid : 'XXXX-XXXX-XXXX-XXXX'
        },
        server : { httpport : 3000 },
        log : {
            isDebug : true,
            isTrace : true,
            isWarn : true,
            isLocalOnly : true
        },
        transaction : {
            timeout : 60000
        }
    })

const api = server
    .api()

api    
    .route('/test$')
    .get(get('/test$'))
    .post(post('/test$'))
    .put(put('/test$'))
    .delete(del('/test$'))
    .patch(patch('/test$'))

//TODO: add API call to self to test a service calling a service
const twoservices = '/test/two-services$'
server
    .api()
    .route(twoservices)
    .post(post(twoservices))
//TODO: add API call to self to timeout
const timeoutservices = '/test/two-services$'
server
    .api()
    .route(timeoutservices)
    .post(post(timeoutservices))


// REMOVE
api.route('/test/json$').get((rq, rs, nxt) => { rs.json({prop:'prop value'})})
api.route('/test/end$') .get((rq, rs, nxt)  => { rs.end()})
api.route('/test/send$').get((rq, rs, nxt) => { rs.send(`{prop:'prop value'}`)})


function get(url: string) {
    const logger = server.logger(`Template server - get '${url}'`)

    return (req: any, res: any, next: any) => {
        const data = req.query.data
        res.setHeader('Yet-another-header', 'header value')
        logger.info(data)
        res.status(200).json({'echo': data}).end()
    }
}

function post(url: string) {
    const logger = server.logger(`Template server - get '${url}'`)

    return (req: any, res: any, next: any) => {
        const data = req.body.data
        logger.info(data)
        res.status(200).json({'echo': data}).end()

    }
}

function put(url: string) {
    const logger = server.logger(`Template server - get '${url}'`)

    return (req: any, res: any, next: any) => {
        const param = req.params.data
        const body = req.body.data

        logger.info(param)
        logger.info(body)

        res.status(201).json({
            'echo param': param, 
            'echo body':body
        }).end()
    }
}

function del(url: string) {
    const logger = server.logger(`Template server - get '${url}'`)

    return (req: any, res: any, next: any) => {
        const param = req.params.data

        logger.info(param)

        res.status(200).json({
            'echo param': param, 
        }).end()

    }
}

function patch(url: string) {
    const logger = server.logger(`Template server - get '${url}'`)

    return (req: any, res: any, next: any) => {
        const param = req.params.data
        const body = req.body.data

        logger.info(param)
        logger.info(body)

        res.status(200).json({
            'echo param': param, 
            'echo body':body
        }).end()
    }
}

server.run()