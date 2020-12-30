

export class TimeoutError extends Error {
    code = 504
    constructor(msg? : string) 
    {
        super(msg)
    }
}