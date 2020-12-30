'use strict'

/**
 * Takes a Request Options object 
 * 
 * Returns :
 * 
 * If successfull, a json object with {code:number, body:<the response body object>}.
 *      Sucessfull response are the ones retrieved with codes 200, 201 or 404
 * 
 * If unsuccessful, a 500 error with a message stating the reason {code:number, message:string}
 */
export function promiseRequest(logger) {
    return (options) => {
        return new Promise((resolve, reject) => {
            request(options, (err, resp, body) => {
                logger.traceDeferred('RESPONSE {\'err\':%o, \'statusCode\':%o, \'body\':%o}', 
                err, resp && resp.statusCode, body && '{...obj...}' || 'empty')// && body.length)

                let statusCode = err && 500 || resp.statusCode
                let errCode = 500
                switch (statusCode) {
                    case 200 :
                    case 201 :
                        //If no valid results, change status code to 404 not found
                        statusCode = body && statusCode || 404
                        resolve({code:statusCode, body:body})
                        break
                    case 401 :
                    case 403 :
                    case 404 :
                        errCode = statusCode
                    default :
                        logger.error(`Failing due to response code '${resp && resp.statusCode}' or err '${err}'`)
                        err = err || new Error(`Failing due to response code '${resp && resp.statusCode}' or err '${err}'`)
                        err.code = errCode
                        reject(err)
                        break
                }
            })
        })
    }
}
