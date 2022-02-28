export interface IMessageType {
    payload:any;
    type:string;
}

export interface IMessage {
    op:string;
    body?:any;
    client?:string;
  }
  
export interface IPayloadMessage{
    message?:IMessage;
    size?:number;
}

export interface IExceptionExec extends Error {
    code?:number;
}