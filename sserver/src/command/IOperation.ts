import { encrypt, encryptBrowser } from './../initconfig/configure';
import { IExceptionExec, IPayloadMessage } from './../interfaces/payload';
import { CustomWebSocket, IResponseClient } from "../interfaces";
import { WebSocketServer } from 'ws';
import { IHashCiper } from '../utils/cipher';
import { MessagePayload, MessageType } from '../payload/message';
import { v4 as uuidv4 } from 'uuid';
import { nodeDAO } from '../initconfig/configure';
export interface IOperationSocket {
    
    getName():string;

    exec(client:CustomWebSocket,server?:WebSocketServer,body?:any,remote?:string):Promise<void>;
}

export interface ISendPayload {
    send(payload:string,ws:CustomWebSocket):void;
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
    
    send(message: string,ws:CustomWebSocket): void {
    
        const encryptedPayload = encrypt.encrypt(message);

        const payloadSend = new MessageType(encryptedPayload,"default");

        const endode = Buffer.from(payloadSend.toSerialize()).toString('base64');

        ws.send(endode, { binary: false});

    } 
}

export class SendPayloadBrowser implements ISendPayload {

    private static instance: SendPayloadBrowser;

    public static getInstance(): SendPayloadBrowser {
        if (!SendPayloadBrowser.instance) {
            SendPayloadBrowser.instance = new SendPayloadBrowser();
        }

        return SendPayloadBrowser.instance;
    }
    
    send(message: string,ws:CustomWebSocket): void {

        const encryptPayload = encryptBrowser.encrypt(message);

        const payloadSend = new MessageType(encryptPayload,"browser");

        try {
            ws.send(Buffer.from(payloadSend.toSerialize()).toString('base64'), { binary: false});    
        } catch (error:unknown) {
            const merror = error as IExceptionExec;
            throw new Error(`Error: ${merror.message}`);
        }
        
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

    async exec(client:CustomWebSocket): Promise<void> {
        console.log("Execute operation not support");
        throw new Error(`OperationNotExist: ${this.message} ${this.code}`);
    }

    getName(): string {
        throw new Error(`OperationNotExist: ${this.message} ${this.code}`);
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

    async exec(client:CustomWebSocket,server?:WebSocketServer,body?:any,remote?:string): Promise<void> {
        console.log("Execute ope Fake command");
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

    async exec(client:CustomWebSocket,server?:WebSocketServer,body?:any,remote?:string): Promise<void> {
        console.log("Execute ope", this.name);
        return Promise.resolve(this.terminate(client));
    }

    getName(): string {
        return this.name;
    }

    terminate(client:CustomWebSocket): void {
       if (client.isAlive){
          client.isAlive = false;
          //client.terminate();
          //https://www.rfc-editor.org/rfc/rfc6455.html#section-7.4
          client.close(1001);
       }
    }
}
export class ConnectCmd implements IOperationSocket {
    
    name:string;

    constructor(){
        this.name = 'Connect';
    }

    async exec(client:CustomWebSocket,server?:WebSocketServer,body?:any,remote?:string): Promise<void> {
        console.log("Execute ope: ",this.name);

        if (client.isAlive){
            //client.remote = client.remote + uuidv4();

            const typeClient = remote || '';

            const response = ReponsePayload.getInstance().generate(typeClient);

            const clientResponse = {
                id:client.remote,
                status:true,
                oper:this.name
            }

            const payloadOb = new MessagePayload("response",clientResponse,remote);

            Promise.resolve(response.send(payloadOb.toSerialize(),client));
        }
        
    }

    getName(): string {
        return this.name;
    }
}
export class CheckClientCmd implements IOperationSocket {
    
    name:string;

    constructor(){
        this.name = 'CheckClient';
    }

    async exec(client:CustomWebSocket,server?:WebSocketServer,body?:any,remote?:string): Promise<void> {

        console.log("Execute ope: ",this.name);

        if (client.isAlive){

            if (client.remote === body.id){

                console.log("OK cliente");
                //await nodeDAO.saveOne(item);

                const clientRemote = remote || 'default';

                const response = ReponsePayload.getInstance().generate(clientRemote);

                const payloadOb = new MessagePayload("response",{capture:true,oper:"Ready"},clientRemote);

                Promise.resolve(response.send(payloadOb.toSerialize(),client));

            }
        }
    }

    getName(): string {
        return this.name;
    }
}

export class AcceptCmd implements IOperationSocket {
    
    name:string;

    constructor(){
        this.name = 'Accept';
    }

    async exec(client:CustomWebSocket,server?:WebSocketServer,body?:any,remote?:string): Promise<void> {

        console.log("Execute ope: ",this.name);

        if (client.isAlive){

            const item = {
                uuid: body.identifier,
                delete: false
            }

            await nodeDAO.saveOne(item);
        }
    }

    getName(): string {
        return this.name;
    }
}

export class BroadcastCmd implements IOperationSocket {
    
    name:string;

    constructor(){
        this.name = 'Broadcast';
    }

    async exec(client:CustomWebSocket,server?:WebSocketServer,body?:any,remote?:string): Promise<void> {

        console.log("Execute ope: ",this.name);
        
        if (!!server) {
            Promise.resolve(this.forward(server,body,remote || "nobody"));
        }
    }

    getName(): string {
        return this.name;
    }

    forward(server:WebSocketServer,body:any,remote:string): void {

        server.clients.forEach(function each(ws:CustomWebSocket) {

            if (ws.isAlive){
            
                const response = ReponsePayload.getInstance().generate(remote);

                const payloadOb = new MessagePayload("response",{capture:true},remote);

                response.send(payloadOb.toSerialize(),ws);

            }
             
          });
    }
}

export class JoinCmd implements IOperationSocket {
    
    name:string;

    constructor(){
        this.name = 'Join';
    }

    //TODO USER check
    checkToken(token:string):Promise<boolean>{
        return Promise.resolve(true);
    }

    async exec(client:CustomWebSocket,server?:WebSocketServer,body?:any,remote?:string): Promise<void> {
        
        console.log("Execute ope: ",this.name);
        
        const {user,tokenid} = body;

        const ok = await this.checkToken(tokenid);
        if (ok && remote){
            
            const response = ReponsePayload.getInstance().generate(remote);

            const payloadObj = new MessagePayload("Join",{status:ok,detail:''},remote);

            Promise.resolve(response.send(payloadObj.toSerialize(),client));

        }
        
    }

    getName(): string {
        return this.name;
    }

    forward(server:WebSocketServer,body:any,remote:string): void {

        server.clients.forEach(function each(ws:CustomWebSocket) {

            if (ws.isAlive){
            
                const response = ReponsePayload.getInstance().generate(remote);

                const payloadOb = new MessagePayload("response",{capture:true},remote);

                response.send(payloadOb.toSerialize(),ws);

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