export interface ITokenDecode {
    id:string;
    roles:string[];
}

export interface IKeyValue {
    [key:string]:string | number;
}

export interface IDeleted{
    deletedCount:number;
    n?:number;
    ok?:number;
}

export type TDeletedMongo = IDeleted;

export interface IUserToken extends Express.User {
    id?:string;
    email:string;
    username:string;
    password:string;
    roles:string[];
    token?:string;
    refreshtoken?:string;
}

export interface IUserID extends Express.User {
    _id?:string;
}

export interface IJWTCustom {
    secretOrKey:string;
    issuer:string;
    audience:string;
}

export class EBase extends Error {

    private code: number;
    private detail: string;
    private httpcode: number;

    constructor(description:string,_code:number,_detail?:string,_httpcode?:number){
        super(description);
        this.detail = _detail || "";
        this.code = _code;
        this.httpcode = _httpcode || -1;
        Error.captureStackTrace(this);
    }

    getHttpCode(){
        return this.httpcode;
    }

    getCode(){
        return this.code;
    }

    getDetail(){
        return this.detail;
    }
}