import { PayloadMessageDTO } from '../dto/payload';
import { IMessage, IMessageType } from '../interfaces/payload';

export class MessagePayload implements IMessage {
    
    op: string;
    body?: any;
    client?: string;

    constructor(_op:string,_body?:any,_client?:string){
        this.op = _op;
        this.body = _body;
        this.client = _client;
    }

    buildPayload():PayloadMessageDTO{
        return {   
            message:{
                op:this.op,
                body: this.body || {},
                client: this.client || ''
            },
            timestamp:Date.now()
        };
    }

    toSerialize():string{
        return JSON.stringify(
        {   message:{
                op:this.op,
                body: this.body || {},
                client: this.client || ''
            }
        })
    }
    
}

export class MessageType implements IMessageType {
    payload: any;
    type: string;

    constructor(_payload:any,_type:string){
        this.payload=_payload;
        this.type=_type;
    }

    toSerialize():string{
        return JSON.stringify(
        {
            payload:this.payload,
            type:this.type
        });
    }

}