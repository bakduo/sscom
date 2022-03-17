import { PayloadMessageDTO } from '../dto/payload';
import { IMessage, IMessageType } from '../interfaces/payload';

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
        },getCircularReplacer())
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
        },getCircularReplacer());
    }

}