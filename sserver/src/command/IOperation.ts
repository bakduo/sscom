import { CustomWebSocket } from "../interfaces";
import { IPayloadMessage } from '../interfaces/payload';
import { WebSocketServer } from 'ws';


export interface IOperationSocket {
    
    getName():string;

    exec(client:CustomWebSocket,server?:WebSocketServer):void;

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

    exec(client:CustomWebSocket,server?:WebSocketServer): void {
        console.log("Execute ope: ",this.name);
        
        if (!!server) {
            this.forward(server);
        }
        
    }

    getName(): string {
        return this.name;
    }

    forward(server:WebSocketServer): void {

        server.clients.forEach(function each(ws:CustomWebSocket) {

            if (ws.isAlive){
                const payload={
                    message:{
                        op:"hello"
                    }
                };
                ws.send(Buffer.from(JSON.stringify(payload)).toString('base64'), { binary: false});
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