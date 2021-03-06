'use strict'

/**
 * Wrapping function with specific point cuts.
 * 
 * Based on : https://trackjs.com/blog/how-to-wrap-javascript-functions/
 * @param {function} _f funtion to be wrapped
 * @param {function} beforeCall - receives f's this pointer and arguments
 * @param {function} afterCall - receives f's return value
 * @param {function} onError - receives thrown error. If onErrror throws an error it will propagate it. So, treat your own errors and rethrow if it makes sense.
 */
export function wrap(_f, beforeCall = undefined, afterCall = undefined, onError = undefined) {
    const n = function end (...args) {
        try {
            if (beforeCall) beforeCall.apply(this, arguments)
            let ret = _f.apply(this, arguments)
            if (afterCall) afterCall(ret)
            return ret
        } 
        catch (e) 
        {
            if (onError) 
            {
                return onError(e)
            }
            else 
            {
                throw e
            }
        }
    }
    for(let prop in _f) { /* #3 */
      if (_f.hasOwnProperty(prop)) {
        n[prop] = _f[prop];
      }
    }
    return n
}
