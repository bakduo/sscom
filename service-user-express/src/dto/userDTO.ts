export interface IUserDTO {
    email:string;
    deleted:boolean;
    username?:string;
    roles:string[];
    password:string;
    id?:string;
}

export interface IPasswordDTO {
    email:string;
    password:string;
}