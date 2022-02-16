import { encrypt } from './../initconfig/configure';
import { IPayloadMessage } from './../interfaces/payload';
import { CustomWebSocket } from "../interfaces";
import { WebSocketServer } from 'ws';
import { IHashCiper } from '../utils/cipher';

export interface IOperationSocket {
    
    getName():string;

    exec(client:CustomWebSocket,server?:WebSocketServer,body?:any):void;
}

interface ISendPayload {
    send(message:IPayloadMessage,ws:CustomWebSocket):void;
}

interface IReceivePayload {
    receive(message:string):IPayloadMessage;
}

export class SendPayload implements ISendPayload {

    private static instance: SendPayload;

    public static getInstance(): SendPayload {
        if (!SendPayload.instance) {
            SendPayload.instance = new SendPayload();
        }

        return SendPayload.instance;
    }
    
    send(message: IPayloadMessage,ws:CustomWebSocket): void {
    
        const encode = encrypt.encrypt(JSON.stringify(message));

        ws.send(Buffer.from(JSON.stringify(encode)).toString('base64'), { binary: false});


    } 
}

export class ReceivePayload implements IReceivePayload {

    private static instance: ReceivePayload;

    public static getInstance(): ReceivePayload {
        if (!ReceivePayload.instance) {
            ReceivePayload.instance = new ReceivePayload();
        }

        return ReceivePayload.instance;
    }

    receive(message: string): IPayloadMessage {

        const encode = Buffer.from(message, 'base64').toString('utf-8');

        const payloadEnc = JSON.parse(encode) as IHashCiper;

        const payloadDec = JSON.parse(encrypt.decrypt(payloadEnc)) as IPayloadMessage;

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

    exec(client:CustomWebSocket,server?:WebSocketServer,body?:any): void {
        console.log("Execute ope: ",this.name);
        
        if (!!server) {
            this.forward(server,body);
        }
        
    }

    getName(): string {
        return this.name;
    }

    forward(server:WebSocketServer,body:object): void {

        server.clients.forEach(function each(ws:CustomWebSocket) {

            console.log(body);

            if (ws.isAlive){
                const payload={
                    message:{
                        op:"response",
                        body:{
                            capture:true
                        }
                    }
                };

                SendPayload.getInstance().send(payload,ws);
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