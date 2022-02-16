import * as crypto from "crypto";

export interface ICipher {
    algorithm:string;
    secretKey:string;
}

export interface IHashCiper {
    iv:string;
    content:string;
}

export interface ICipherEnc <T> {
    encrypt(block:T):T;
    decrypt(block:T):T;
}

export class CipherPayload implements ICipherEnc<IHashCiper | string> {

    algorithm:string;
    secretKey:string;
    iv:Buffer;

    constructor(config:ICipher){
        this.algorithm = config.algorithm;
        this.secretKey = config.secretKey;
        this.iv = crypto.randomBytes(16);
    }

    encrypt = (block:string):IHashCiper => {


        try {
            const cipher = crypto.createCipheriv(this.algorithm, Buffer.from(this.secretKey), this.iv);
    
            const encrypted = Buffer.concat([cipher.update(block), cipher.final()]);

            return {
                iv: this.iv.toString('hex'),//tener en cuenta que debe ser HEX sino crypto.randomBytes(24).toString('hex')
                content: encrypted.toString('hex')
            };

        } catch (error:unknown) {
            const err = error as Error;
            //loggerApp.error(`Exception on ecncript token function encrypt: ${err.message}`);            
            throw new Error(`Exception on encrypt into token`);
        }

    };
    
    decrypt = (block:IHashCiper):string => {
    
        const decipher = crypto.createDecipheriv(this.algorithm, Buffer.from(this.secretKey), Buffer.from(block.iv, 'hex'));
    
        const decrpyted = Buffer.concat([decipher.update(Buffer.from(block.content, 'hex')), decipher.final()]);
    
        return decrpyted.toString();
    };
    
}