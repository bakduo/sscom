import { ClientConsumer } from './utils/consumer';
import { CustomWebSocket } from './interfaces/socket';
import { IPayloadMessage, IMessage, IExceptionExec } from './interfaces/payload';
//import { createServer } from 'https';
import { createServer, IncomingMessage } from 'http';
import { WebSocketServer } from 'ws';
//import * as fs from 'fs';
import { ManagerOperation, FinishCmd, FakeCmd, IOperationSocket, BroadcastCmd, ConnectCmd, ReponsePayload, CheckClientCmd } from './command/IOperation';
import { appconfig, loggerApp, nodeDAO } from './initconfig/configure';
import { MessagePayload } from './payload';
import { isStringObject } from 'util/types';

//TODO SECURE CERTIFY
// const serverHttps = createServer({
//    cert: fs.readFileSync('./config/certs/server.crt'),
//    key: fs.readFileSync('./config/certs/server.key')
//   });
  
const serverHttp = createServer();

const managerOp = new ManagerOperation();

const clientRemote = new ClientConsumer();

managerOp.addOperation(new FinishCmd());
managerOp.addOperation(new FakeCmd());
managerOp.addOperation(new BroadcastCmd());
managerOp.addOperation(new ConnectCmd());
managerOp.addOperation(new CheckClientCmd());


function checkConnectionSocket(info:any,callback:CallableFunction){
  console.log("checkConnectionSocker");
  //console.log(info);
  //return cb(false, 401, "Unauthorized");
  callback(true);
}

const ServerOptionsTest = {
  server: serverHttp,
  host: "sserver.oncosmos.com",
  verifyClient: checkConnectionSocket,
  clientTracking: true,
  maxPayload: 90000
}

const wss = new WebSocketServer(ServerOptionsTest);

wss.on('connection', function (connection:CustomWebSocket,req:IncomingMessage){

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

      try {

        await oper.exec(connection,wss,body,client)
      
      }catch (error:unknown) {
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

  });

  connection.on('pong', function(data:any){

    console.log("Desde pong");

  });

  connection.on('close', function(code:any, data:any){

    if (connection.exception?.enable){

      loggerApp.info(`Cierre de conexión por: ${connection.exception.message} codigo server: ${code}`);
    }
    

  });


})

wss.on('error', function (message:IExceptionExec) {
  loggerApp.error(`message from error ${message}`);
});

const interval = setInterval(function checkAlive() {

  wss.clients.forEach(function each(ws:CustomWebSocket) {

    if (ws.isAlive === false) return ws.terminate();

     ws.ping();
     
  });
}, 21000);

wss.on('close', function close(code:any, data:any) {
  loggerApp.info(code);
  const reason = data.toString();
  // Continue as before.
  clearInterval(interval);
});

serverHttp.listen(appconfig.port,function(){
  console.log(`Listen ${appconfig.port}`);
});