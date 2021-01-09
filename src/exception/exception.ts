

export class TimeoutError extends Error {
    code = 504
    constructor(msg? : string) 
    {
        super(msg)
    }
}

export class HttpError extends Error {
    code : number = 500
    constructor(msg? : string)
    {
        super(msg)
    }
}