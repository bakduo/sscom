export interface ITokenDTO {
    token:string;
    refreshToken:string;
    tmptoken?:string;
    email?:string;
    username?:string;
    date?:number;
    timestamp?:number;
}