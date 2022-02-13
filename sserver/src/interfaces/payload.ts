
export interface IMessage {
    op:string;
    body?:object;
  }
  
export interface IPayloadMessage{
    message?:IMessage;
    size?:number;
}

export interface IExceptionExec extends Error {
    code?:number;
}