import * as crypto from 'crypto';

import CryptoJS from 'crypto-js';

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
    setConfig(config:ICipher):void;
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
    setConfig(config: ICipher): void {
        throw new Error('Method not implemented.');
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

        console.log(block);
    
        const decipher = crypto.createDecipheriv(this.algorithm, Buffer.from(this.secretKey), Buffer.from(block.iv, 'hex'));
    
        const decrpyted = Buffer.concat([decipher.update(Buffer.from(block.content, 'hex')), decipher.final()]);
    
        return decrpyted.toString();
    };
    
}

export class CipherBrowserPayload implements ICipherEnc<string> {

    algorithm:string;
    secretKey:string;
    iv:Buffer;

    constructor(config:ICipher){
        this.algorithm = config.algorithm;
        this.secretKey = config.secretKey;
        this.iv = crypto.randomBytes(16);
    }
    setConfig(config: ICipher): void {
        throw new Error('Method not implemented.');
    }

    encrypt = (block:string):any => {


        try {
            
            return CryptoJS.AES.encrypt(Buffer.from(block).toString('base64'), this.secretKey);

        } catch (error:unknown) {
            const err = error as Error;
            throw new Error(`Exception on encrypt into token`);
        }

    };
    
    decrypt = (block:any):any => {
    
        
        try {
        
            const decriptedBlock = CryptoJS.AES.decrypt(block,this.secretKey,{ iv: block.iv});

            const strdecode = Buffer.from(decriptedBlock.toString(CryptoJS.enc.Utf8), 'base64').toString('utf-8');

            return strdecode;

        } catch (error:unknown) {
            const err = error as Error;
            throw new Error(`Exception on encrypt into token ${err.message}`);
        }
     
    };
    
}