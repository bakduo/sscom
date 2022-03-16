import { IConfigure } from './../src/initconfig/configure';
import { expect } from "chai";
import { CipherBrowserPayload } from '../src/utils/cipher';
import config from 'config';
import { MessagePayload } from '../src/payload/message';
import { IPayloadMessage, IMessage } from '../src/interfaces/payload';

describe('Test CipherBrowser UNIT',async () => {

    let cipherBrowser:any;
    let payloadOrig:any;
    let encryptPayload:any;
    let decryptPayload:any;
    let body:any;

    const appconfig:IConfigure = config.get('app');

    before(async function(){

        console.log("###############BEGIN TEST#################");

        cipherBrowser = new CipherBrowserPayload({
            algorithm:appconfig.encrypt.algorithm,
            secretKey:appconfig.encrypt.secretKey
        });

        body = {sample:'dadadadadadadaa',finalize:true,example:1000};

        payloadOrig = new MessagePayload("Unaoper",body,"aclient");

    });

    after(async () => {
        console.log("###############AFTER TEST#################");
    });

    describe('Cipher payload', () => {

        it('Debería cifrar el contenido', async () => {

            encryptPayload  = cipherBrowser.encrypt(payloadOrig.toSerialize());

            expect(encryptPayload).to.have.own.property('init');

            expect(encryptPayload).to.have.own.property('iv');

            expect(encryptPayload).to.have.own.property('blockSize');
            
            expect(encryptPayload).to.have.own.property('algorithm');

        });

        it('Debería decifrar el contenido', async () => {

            decryptPayload  = cipherBrowser.decrypt(encryptPayload);

            const payloadDec = JSON.parse(decryptPayload) as IPayloadMessage;

            const messageDecrypt = payloadDec.message as IMessage;

            expect(payloadDec).to.be.an('object');

            expect(payloadDec).to.have.property('message');

            expect(payloadDec.message).to.be.an('object');

            expect(payloadDec.message).to.have.all.keys('op','body','client');

            expect(messageDecrypt).to.be.an('object');

            expect(messageDecrypt.body).to.have.all.keys('sample','finalize','example');

            expect(messageDecrypt.body.sample).to.be.an('string');

            expect(messageDecrypt.body.finalize).to.be.an('boolean');

            expect(messageDecrypt.body.example).to.be.an('number');

        });


    });


});