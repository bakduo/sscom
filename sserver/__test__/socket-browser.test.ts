import { FinishCmd, JoinCmd, ReponsePayload } from './../src/command/IOperation';
import { IConfigure, loggerApp } from "../src/initconfig/configure";
import config from 'config';
import { MessagePayload } from "../src/payload";
//import { expect } from 'chai';
import * as chai from 'chai';
import { createServer, IncomingMessage } from 'http';
import { WebSocketServer } from 'ws';
import { CustomWebSocket, IExceptionExec, IMessage, IPayloadMessage } from "../src/interfaces";
import { ClientConsumer } from "../src/utils/consumer";
import { FakeCmd, IOperationSocket, ManagerOperation, SendPayloadBrowser } from "../src/command/IOperation";
import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';

const expect = chai.expect;
const should = chai.should();

describe('Test WebSocket for Browser UNIT',async () => {

    const appconfig:IConfigure = config.get('app');
    let serverHttp:any;
    let clientRemote:any;
    let managerOp:any;
    let wss:any;
    let ServerOptionsTest:any;

    before(function(){

        console.log("###############BEGIN TEST#################");
      
        serverHttp = createServer();

        clientRemote = new ClientConsumer();

        managerOp = new ManagerOperation();
        
        managerOp.addOperation(new FakeCmd());

        managerOp.addOperation(new FinishCmd());

        managerOp.addOperation(new JoinCmd());

        ServerOptionsTest = {
            server: serverHttp,
            host: "localhost",
            clientTracking: true,
            maxPayload: 90000
        }

        wss = new WebSocketServer(ServerOptionsTest);

        serverHttp.listen(appconfig.port,function(){
            console.log(`Up to port: ${appconfig.port}`);
        });

    });

    after(() => {
        console.log("###############AFTER TEST#################");

        // wss.clients.forEach((socket:CustomWebSocket) => {
        //     socket.close();
        // });

        // wss.terminate();

        if(serverHttp) {
            
            serverHttp.on('close', () => { console.log('AFTER'); });

            //console.log('CLOSING');

            //serverHttp.close(done);

			serverHttp.close(() => { console.log('CLOSING'); serverHttp.unref();});
            
		}
    });

    describe('WebSocket payload Not effective', () => {

        it('No Debería recibir datos de la conexión browser', async () => {

            wss.options.maxPayload=20;

            wss.removeAllListeners("connection");
            wss.removeAllListeners("close");
            
            wss.on('connection',function (connection:CustomWebSocket,req:IncomingMessage){

                let keyHeader = "";

                if ((req.rawHeaders[3]) && (typeof req.rawHeaders[3] === 'string')){
                    keyHeader = req.rawHeaders[3];
                }else{
                    loggerApp.error("No existe parametros de comunicación de Socket");
                    throw new Error("No existe parametros de comunicación de Socket");
                }

                connection.isAlive = true;

                connection.remote = keyHeader;

                connection.removeAllListeners('message');

                connection.on('message', function message(payload, isBinary) {
    
                    const message = isBinary ? payload : payload.toString();
                
                    const receive = clientRemote.generate(message.toString());
                
                    receive.setPayload(clientRemote.getPayload(message.toString()));
                
                    const payloadObj: IPayloadMessage = receive.decodePayload();
                
                    if (payloadObj.message){
                
                        const {op,body,client} = payloadObj.message as IMessage;
                
                        const oper:IOperationSocket = managerOp.get(op);

                    }
                    });
                
                connection.on('error', function (message:IExceptionExec) {

                    switch (message.name) {
                        case 'RangeError':
                        connection.exception = {
                            enable: true,
                            name: 'RangeError',
                            message: `${message.message}`
                        };
                        break;
                    }

                    expect(message.message).to.be.a('string');

                    expect(message.message).to.be.equal('Max payload size exceeded');
                
                });

                expect(req.socket.remoteAddress).to.be.a('string');
                
            });
            
            const ws = new WebSocket(`ws://localhost:${appconfig.port}/`, {
              perMessageDeflate: false
            });
        
            ws.on('open', function open() {
                const payloadObj = new MessagePayload("FakeCmd",{sample:'hola mundo'},"webextension");

                SendPayloadBrowser.getInstance().send(payloadObj.toSerialize(),ws);

                //cierro la conexión cliente del browser
                //ws.close();
            });

            ws.on('close', function close(code:any, data:any) {
                console.log('Close cliente');
                expect(code).to.be.equal(1009);
            });

        });

    });

    describe('WebSocket payload effective', () => {

        it('Debería recibir datos de la conexión browser', async () => {

            wss.options.maxPayload=90000;

            wss.removeAllListeners("connection");
            wss.removeAllListeners("close");

            wss.on('connection',function (connection:CustomWebSocket,req:IncomingMessage){

                let keyHeader = "";

                if ((req.rawHeaders[3]) && (typeof req.rawHeaders[3] === 'string')){
                    keyHeader = req.rawHeaders[3];
                }else{
                    loggerApp.error("No existe parametros de comunicación de Socket");
                    throw new Error("No existe parametros de comunicación de Socket");
                }

                connection.isAlive = true;

                connection.remote = keyHeader;

                connection.removeAllListeners('message');

                connection.on('message', function message(payload, isBinary) {
    
                    const message = isBinary ? payload : payload.toString();
                
                    const receive = clientRemote.generate(message.toString());
                
                    receive.setPayload(clientRemote.getPayload(message.toString()));
                
                    const payloadObj: IPayloadMessage = receive.decodePayload();
                
                    if (payloadObj.message){
                
                        const {op,body,client} = payloadObj.message as IMessage;
                
                        const oper:IOperationSocket = managerOp.get(op);
                
                        expect(oper.getName()).to.equal('FakeCmd');

                        expect(client).to.equal('webextension');

                    }
                    });

                expect(req.socket.remoteAddress).to.be.a('string');
                
                connection.close();
            })
        
            
            wss.on('close',function close(code:any, data:any){
                console.log(code);
            });
            
            const ws = new WebSocket(`ws://localhost:${appconfig.port}/`, {
              perMessageDeflate: false
            });

            ws.removeAllListeners("open");
        
            ws.on('open', function open() {
                const payloadObj = new MessagePayload("FakeCmd",{sample:'hola mundo'},"webextension");
                SendPayloadBrowser.getInstance().send(payloadObj.toSerialize(),ws);
                //cierro la conexión cliente del browser
            });

        });

    });

    describe('WebSocket error operations', () => {

        it('Debería recibir payload y avisar que no es un comando valido', async () => {

            wss.removeAllListeners('connection');
            wss.removeAllListeners('close');

            wss.on('connection',function (connection:CustomWebSocket,req:IncomingMessage){

                let keyHeader = "";

                if ((req.rawHeaders[3]) && (typeof req.rawHeaders[3] === 'string')){
                    keyHeader = req.rawHeaders[3];
                }else{
                    loggerApp.error("No existe parametros de comunicación de Socket");
                    throw new Error("No existe parametros de comunicación de Socket");
                }

                connection.isAlive = true;

                connection.remote = keyHeader;

                connection.removeAllListeners("message");

                connection.on('message', async function message(payload, isBinary) {
    
                    const message = isBinary ? payload : payload.toString();
                
                    const receive = clientRemote.generate(message.toString());
                
                    receive.setPayload(clientRemote.getPayload(message.toString()));
                
                    const payloadObj: IPayloadMessage = receive.decodePayload();

                    const expectedError = new Error(`OperationNotExist: Operation NOEXISTE: don't exists  -1`)

                    if (payloadObj.message){
                
                            const {op,body,client} = payloadObj.message as IMessage;

                            try {
                                const oper:IOperationSocket = managerOp.get(op);
                                await oper.exec(connection,wss,body,client);
                            } catch (error:unknown) {
                                const merror = error as IExceptionExec;

                                loggerApp.error(merror.message);

                                const {client} = payloadObj.message as IMessage;

                                const typeClient = client || "default";

                                const response = ReponsePayload.getInstance().generate(typeClient);
                                const clientResponse = {
                                    message:'Operation not support',
                                    status:false
                                }

                                const payloadOb = new MessagePayload("response",clientResponse,typeClient);

                                response.send(payloadOb.toSerialize(),connection);
                            } 
                        }
                    });
            })
        
            
            wss.on('close',function close(code:any, data:any){
                console.log(code);
            });
            
            const ws = new WebSocket(`ws://localhost:${appconfig.port}/`, {
              perMessageDeflate: false
            });

            ws.removeAllListeners("open");
            ws.removeAllListeners("message");
        
            ws.on('open', function open() {
                const payloadObj = new MessagePayload("NOEXISTE",{sample:'hola mundo'},"webextension");
                SendPayloadBrowser.getInstance().send(payloadObj.toSerialize(),ws);
            });

            ws.on('message', function message(payload,isBinary) {
            
                const message = isBinary ? payload : payload.toString();
            
                const receive = clientRemote.generate(message.toString());
            
                receive.setPayload(clientRemote.getPayload(message.toString()));
            
                const payloadObj: IPayloadMessage = receive.decodePayload();

                expect(payloadObj.message?.body).to.have.property('status');

                expect(payloadObj.message?.body).to.have.property('message');

                expect(payloadObj.message?.body?.status).to.equal(false);

                expect(payloadObj.message?.body?.message).to.equal("Operation not support");
            
            });

        });

        it('Debería recibir payload y avisar que no es un comando valido 2', async () => {
            
            wss.on('connection',function (connection:CustomWebSocket,req:IncomingMessage){

                wss.removeAllListeners('connection');
                wss.removeAllListeners('close');

                let keyHeader = "";

                if ((req.rawHeaders[3]) && (typeof req.rawHeaders[3] === 'string')){
                    keyHeader = req.rawHeaders[3];
                }else{
                    loggerApp.error("No existe parametros de comunicación de Socket");
                    throw new Error("No existe parametros de comunicación de Socket");
                }

                connection.isAlive = true;

                connection.remote = keyHeader;

                connection.on('message', async function message(payload, isBinary) {
    
                    const message = isBinary ? payload : payload.toString();
                
                    const receive = clientRemote.generate(message.toString());
                
                    receive.setPayload(clientRemote.getPayload(message.toString()));
                
                    const payloadObj: IPayloadMessage = receive.decodePayload();
                
                    if (payloadObj.message){
                
                        const {op,body,client} = payloadObj.message as IMessage;

                        try {
                            const oper:IOperationSocket = managerOp.get(op);
                            await oper.exec(connection,wss,body,client);
                        } catch (error:unknown) {
                            const merror = error as IExceptionExec;
                            expect(merror.message).to.contain("OperationNotExist"); //Otra forma de manejar la expcetion
                        }
                    }
                    });
            })
        
            
            wss.on('close',function close(code:any, data:any){
                console.log(code);
            });
            
            const ws = new WebSocket(`ws://localhost:${appconfig.port}/`, {
              perMessageDeflate: false
            });

            ws.removeAllListeners("open");
            ws.removeAllListeners("message");
        
            ws.on('open', function open() {
                const payloadObj = new MessagePayload("sdfdsfdsfdsfdsfds");
                SendPayloadBrowser.getInstance().send(payloadObj.toSerialize(),ws);
            });

        });

        it('Debería recibir payload y cerrar la conexión del cliente', async () => {

            wss.removeAllListeners('connection');
            wss.removeAllListeners('close');

            wss.on('connection',function (connection:CustomWebSocket,req:IncomingMessage){
                let keyHeader = "";
                if ((req.rawHeaders[3]) && (typeof req.rawHeaders[3] === 'string')){
                    keyHeader = req.rawHeaders[3];
                }else{
                    loggerApp.error("No existe parametros de comunicación de Socket");
                    throw new Error("No existe parametros de comunicación de Socket");
                }

                connection.isAlive = true;
                connection.remote = keyHeader;
                connection.on('message', async function message(payload, isBinary) {
                    const message = isBinary ? payload : payload.toString();
                    const receive = clientRemote.generate(message.toString());
                    receive.setPayload(clientRemote.getPayload(message.toString()));
                    const payloadObj: IPayloadMessage = receive.decodePayload();
                    if (payloadObj.message){
                        const {op,body,client} = payloadObj.message as IMessage;
                        const oper:IOperationSocket = managerOp.get(op);
                        await oper.exec(connection,wss,body,client);          
                    }
                });
            })
        
            
            wss.on('close',function close(code:any, data:any){
                console.log("SERVER:");
                console.log(code);
            });
            
            const ws = new WebSocket(`ws://localhost:${appconfig.port}/`, {
              perMessageDeflate: false
            });

            ws.removeAllListeners("open");
            ws.removeAllListeners("message");
        
            ws.on('open', function open() {
                const payloadObj = new MessagePayload("Finished",{sample:"Hola mundo",type:"webextension"});
                SendPayloadBrowser.getInstance().send(payloadObj.toSerialize(),ws);
            });

            ws.on('close',function close(code:any, data:any){
                console.log('Client disconnected');
                console.log(`Cierre de conexión por codigo: ${code}`);
                expect(code).to.equal(1001);            
            });

        });

        it('Debería recibir payload luego de hacer join', async () => {

            wss.removeAllListeners('connection');
            wss.removeAllListeners('close');
            
            wss.on('connection',function (connection:CustomWebSocket,req:IncomingMessage){

                let keyHeader = "";

                if ((req.rawHeaders[3]) && (typeof req.rawHeaders[3] === 'string')){
                    keyHeader = req.rawHeaders[3];
                }else{
                    loggerApp.error("No existe parametros de comunicación de Socket");
                    throw new Error("No existe parametros de comunicación de Socket");
                }

                connection.isAlive = true;

                connection.remote = keyHeader;

                connection.on('message', async function message(payload, isBinary) {
    
                    const message = isBinary ? payload : payload.toString();
                
                    const receive = clientRemote.generate(message.toString());
                
                    receive.setPayload(clientRemote.getPayload(message.toString()));
                
                    const payloadObj: IPayloadMessage = receive.decodePayload();
                
                    if (payloadObj.message){
                
                        const {op,body,client} = payloadObj.message as IMessage;

                        const oper:IOperationSocket = managerOp.get(op);

                        await oper.exec(connection,wss,body,client);
                        
                    }
                });

            })
        
            
            wss.on('close',function close(code:any, data:any){
                console.log("SERVER:");
                console.log(code);
            });
            
            const ws = new WebSocket(`ws://localhost:${appconfig.port}/`, {
              perMessageDeflate: false
            });

            ws.removeAllListeners("open");
            ws.removeAllListeners("close");
            ws.removeAllListeners("message");

            ws.on('message', function message(payload,isBinary) {

                //console.log('received: %s', payload);
            
                const message = isBinary ? payload : payload.toString();
            
                const receive = clientRemote.generate(message.toString());
            
                receive.setPayload(clientRemote.getPayload(message.toString()));
            
                const payloadObj: IPayloadMessage = receive.decodePayload();

                console.log(payloadObj);

                expect(payloadObj.message?.body).to.have.property('status');

                expect(payloadObj.message?.body).to.have.property('detail');

                expect(payloadObj.message?.body?.status).to.equal(true);

                expect(payloadObj.message?.body?.detail).to.length(0);

                ws.close();
            
            });
        
            ws.on('open', function open() {

                const orig = uuidv4();
                const payloadObj = new MessagePayload("Join",{user:orig,token:'tokenid'},"webextension");
                SendPayloadBrowser.getInstance().send(payloadObj.toSerialize(),ws);
            });

            ws.on('close',function close(code:any, data:any){
                console.log('Client disconnected');
                console.log(`Cierre de conexión por codigo: ${code}`);       
            });

        });

    });

});
