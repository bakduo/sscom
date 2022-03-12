import { encrypt, encryptBrowser } from './../initconfig/configure';
import { IPayloadMessage } from './../interfaces/payload';
import { CustomWebSocket, IResponseClient } from "../interfaces";
import { WebSocketServer } from 'ws';
import { IHashCiper } from '../utils/cipher';
import { MessagePayload, MessageType } from '../payload/message';
import { PayloadMessageDTO } from '../dto/payload';

export interface IOperationSocket {
    
    getName():string;

    exec(client:CustomWebSocket,server?:WebSocketServer,body?:any,remote?:string):void;
}

export interface ISendPayload {
    send(payload:PayloadMessageDTO,ws:CustomWebSocket):void;
}

export interface IReceivePayload<T> {

    decodePayload():IPayloadMessage;
    setPayload(message:T):void;
}

export class SendPayloadDefault implements ISendPayload {

    private static instance: SendPayloadDefault;

    public static getInstance(): SendPayloadDefault {
        if (!SendPayloadDefault.instance) {
            SendPayloadDefault.instance = new SendPayloadDefault();
        }

        return SendPayloadDefault.instance;
    }
    
    send(message: PayloadMessageDTO,ws:CustomWebSocket): void {
    
        const encryptedPayload = encrypt.encrypt(JSON.stringify(message));

        const payloadSend = new MessageType(encryptedPayload,"default");

        const endode = Buffer.from(payloadSend.toSerialize()).toString('base64');

        ws.send(endode, { binary: false});

    } 
}

const getCircularReplacer = () => {
    const seen = new WeakSet();
    return (key:any, value:any) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
          return;
        }
        seen.add(value);
      }
      return value;
    };
};


export class SendPayloadBrowser implements ISendPayload {

    private static instance: SendPayloadBrowser;

    public static getInstance(): SendPayloadBrowser {
        if (!SendPayloadBrowser.instance) {
            SendPayloadBrowser.instance = new SendPayloadBrowser();
        }

        return SendPayloadBrowser.instance;
    }
    
    send(payload: PayloadMessageDTO,ws:CustomWebSocket): void {

        const { message } = payload;
        
        const encryptPayload = encryptBrowser.encrypt(JSON.stringify(message,getCircularReplacer()));

        const payloadSend = new MessageType(encryptPayload,"browser");

        ws.send(Buffer.from(payloadSend.toSerialize()).toString('base64'), { binary: false});
    } 
}

export class ReponsePayload implements IResponseClient {

    private static instance: ReponsePayload;

    public static getInstance(): ReponsePayload {
        if (!ReponsePayload.instance) {
            ReponsePayload.instance = new ReponsePayload();
        }

        return ReponsePayload.instance;
    }

    generate(client: string): ISendPayload {
        switch (client) {
            case "webextension":
                return SendPayloadBrowser.getInstance();
            default:
                return SendPayloadDefault.getInstance();
        }
    }
}


export class ReceivePayloadDefault implements IReceivePayload<IHashCiper> {

    private static instance: ReceivePayloadDefault;
    
    _message : IHashCiper;
    
    constructor(){
        this._message = {iv:'',content:''};
    }

    setPayload(message: IHashCiper): void {
        this._message = message;
    }

    public static getInstance(): ReceivePayloadDefault {
        if (!ReceivePayloadDefault.instance) {
            ReceivePayloadDefault.instance = new ReceivePayloadDefault();
        }

        return ReceivePayloadDefault.instance;
    }

    decodePayload(): IPayloadMessage {

        const payloadDec = JSON.parse(encrypt.decrypt(this._message)) as IPayloadMessage;

        console.log(payloadDec);

        return payloadDec;
        
    }

}

export class ReceivePayloadBrowser implements IReceivePayload<string> {
    

    private static instance: ReceivePayloadBrowser;

    _message:string;

    constructor(){
        this._message = '';
    }

    public static getInstance(): ReceivePayloadBrowser {
        if (!ReceivePayloadBrowser.instance) {
            ReceivePayloadBrowser.instance = new ReceivePayloadBrowser();
        }

        return ReceivePayloadBrowser.instance;
    }

    setPayload(message: string): void {
        this._message = message;
    }

    decodePayload(): IPayloadMessage {

        const postDecode = encryptBrowser.decrypt(this._message);

        const payloadDec = JSON.parse(postDecode) as IPayloadMessage;

        return payloadDec;
        
    }

}


interface IOperationNotExist {
    status?:string;
    message?:string;
    code?:number;
}

export class OperationNotExist implements IOperationSocket{
    status:string;
    code:number;
    message:string;

    constructor(_ope:IOperationNotExist){
        this.status = _ope.status || '';
        this.code = _ope.code || -1;
        this.message = _ope.message || '';
    }
    exec(client:CustomWebSocket): void {
        throw new Error(`OperationNotExist: ${this.message}  ${this.code}`);
    }

    getName(): string {
        throw new Error(`OperationNotExist: ${this.message}  ${this.code}`);
    }

}

export interface IManagerOperation {

    get(op:string):IOperationSocket;

    addOperation(operation:IOperationSocket):void;
}

export class FakeCmd implements IOperationSocket {
    
    name:string;

    constructor(){
        this.name = 'FakeCmd'
    }

    exec(client:CustomWebSocket): void {
        console.log("Execute ope");
    }

    getName(): string {
        return this.name;
    }

}

export class FinishCmd implements IOperationSocket {
    
    name:string;

    constructor(){
        this.name = 'Finished'
    }

    exec(client:CustomWebSocket): void {
        console.log("Execute ope", this.name);
        this.terminate(client);
    }

    getName(): string {
        return this.name;
    }

    terminate(client:CustomWebSocket): void {
       if (client.isAlive){
        client.terminate();
       }
    }
}

export class BroadcastCmd implements IOperationSocket {
    
    name:string;

    constructor(){
        this.name = 'Broadcast';
    }

    exec(client:CustomWebSocket,server?:WebSocketServer,body?:any,remote?:string): void {
        console.log("Execute ope: ",this.name);
        
        if (!!server) {
            this.forward(server,body,remote || "nobody");
        }
        
    }

    getName(): string {
        return this.name;
    }

    forward(server:WebSocketServer,body:any,remote:string): void {

        server.clients.forEach(function each(ws:CustomWebSocket) {

            console.log(body,remote);

            if (ws.isAlive){
            
                const response = ReponsePayload.getInstance().generate(remote);

                const payloadOb = new MessagePayload("response",{capture:true},remote);

                response.send(payloadOb.buildPayload(),ws);

            }
             
          });
    }
}

export class ManagerOperation implements IManagerOperation {

    operations: IOperationSocket[];

    constructor(){
        this.operations = [];    
    }

    addOperation(operation: IOperationSocket): void {
        this.operations.push(operation);
    }

    get(op: string): IOperationSocket {

        const opcmd = this.operations.find((item)=>{
            return item.getName()===op;
        });

        if (opcmd){
            return opcmd;
        }
        return new OperationNotExist({message:`Operation ${op}: don't exists `});
    }

}