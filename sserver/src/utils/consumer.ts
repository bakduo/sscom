import { IReceivePayload, ReceivePayloadBrowser, ReceivePayloadDefault } from "../command/IOperation";
import { IMessageType } from "../interfaces";
import { IReceiveClient } from '../interfaces/socket';
import { IHashCiper } from './cipher';

export class ClientConsumer implements IReceiveClient<IHashCiper|string> {

    getPayload(message: string):any {

        const payloadString = Buffer.from(message, 'base64').toString('utf-8');   
 
        const client = JSON.parse(payloadString) as IMessageType;

        return client.payload;
    }

    generate(message: string): IReceivePayload<IHashCiper|string> {
        
        const payloadString = Buffer.from(message, 'base64').toString('utf-8');

        const client = JSON.parse(payloadString) as IMessageType;

        switch (client.type) {
            case "browser":
                return ReceivePayloadBrowser.getInstance();
            default:
                return ReceivePayloadDefault.getInstance();
        }
    }
}