import { IPayloadMessage } from "../interfaces/payload";

export interface PayloadMessageDTO extends IPayloadMessage {
    timestamp:number;
}