import WebSocket from 'ws';
import { IReceivePayload, ISendPayload } from '../command/IOperation';

export interface CustomWebSocket extends WebSocket{
    isAlive?:boolean;
}

export interface IResponseClient {
    generate(client:string):ISendPayload;
}

export interface IReceiveClient<T> {
    generate(message:string):IReceivePayload<T>;
    getPayload(message:string):any;
}