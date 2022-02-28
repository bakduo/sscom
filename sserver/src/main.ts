import { ClientConsumer } from './utils/consumer';
import { CustomWebSocket } from './interfaces/socket';
import { IPayloadMessage, IMessage, IExceptionExec } from './interfaces/payload';
//import { createServer } from 'https';
import { createServer, IncomingMessage } from 'http';
import { WebSocketServer } from 'ws';
import * as fs from 'fs';
import { ManagerOperation, FinishCmd, FakeCmd, IOperationSocket, BroadcastCmd } from './command/IOperation';
import { appconfig } from './initconfig/configure';


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

  //console.log(req.rawHeaders);

  console.log(req.socket.remoteAddress);

  connection.isAlive = true;

  connection.on('pong', function(data:any){

      console.log("Desde pong");

  });

  connection.on('message', function message(payload, isBinary) {
    
    const message = isBinary ? payload : payload.toString();

    const receive = clientRemote.generate(message.toString());

    receive.setPayload(clientRemote.getPayload(message.toString()));

    const payloadObj: IPayloadMessage = receive.decodePayload();

    if (payloadObj.message){

      const {op,body,client} = payloadObj.message as IMessage;

      const oper:IOperationSocket = managerOp.get(op);

      try {
        oper.exec(connection,wss,body,client);
      }catch (error:unknown) {
        const merror = error as IExceptionExec;
        console.log(merror.message);
      }
    }
    
  });

})

wss.on('error', function (message) {
  console.log("message from error"); 
});

const interval = setInterval(function checkAlive() {

  wss.clients.forEach(function each(ws:CustomWebSocket) {

    if (ws.isAlive === false) return ws.terminate();

     ws.ping();
     
  });
}, 21000);

wss.on('close', function close(code:any, data:any) {
  console.log(code);
  const reason = data.toString();
  // Continue as before.
  clearInterval(interval);
});

serverHttp.listen(appconfig.port,function(){
  console.log(`Listen ${appconfig.port}`);
});