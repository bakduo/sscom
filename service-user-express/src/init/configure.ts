import config from 'config';
import MongoConnect from '../datastore/wmongo';
import pino from "pino";
import stream from 'stream';
import childProcess from 'child_process';

const logThrough = new stream.PassThrough();

// Environment variables
const cwd = process.cwd();
const { env } = process;
const logPath = cwd + '/log';

const child = childProcess.spawn(
    process.execPath,
    [
      require.resolve('pino-tee'),
      'warn',
      `${logPath}/log.warn.log`,
      'error',
      `${logPath}/log.error.log`,
      'info',
      `${logPath}/log.info.log`,
      'debug',
      `${logPath}/log.debug.log`,
    ],
    { cwd, env }
  );
  
logThrough.pipe(child.stdin);

export const loggerApp = pino(
{
    name: 'service-user',
    level: 'debug'
},
logThrough
);

export const ERRORS_APP = {
    'EInvalidCredential':{
        detail:'User or password invalid',
        code:1000,
        HttpStatusCode: 401
    },
    'ETokenInvalid':{
        detail:'Token invalid',
        code:1001,
        HttpStatusCode: 403
    },
    'ERequestInvalid':{
        detail:'Request invalid',
        code: 1002,
        HttpStatusCode: 400
    },
    'EInvalidUser':{
        detail:'Invalid user or password',
        code: 1003,
        HttpStatusCode: 401
    },
    'ESaveUser':{
        detail:'Exception on save user into datastore',
        code: 1004,
        HttpStatusCode: 500
    },
    'EFindUser':{
        detail:'Exception on findone on datastore',
        code: 1005,
        HttpStatusCode: 500
    },
    'EBase':{
        detail:'Exception generic',
        code: 999,
        HttpStatusCode: 500
    },
}

export interface IConfigDB {
    db:{
        mongo:{
            url:string;
            dbname:string;
            host:string;
            user:string;
            password:string;
            secure:boolean;
            port:number;
        }
    },
    jwt:{
        secretRefresh:string;
        secret: string;
        session: boolean;
        timeToken:string;
    },
    port:number;
    hostname:string;
    secure:boolean;
    protocol:string;
    logpath:string;
}

export const appconfig:IConfigDB = config.get('app');

export const connectionDB = MongoConnect.getInstance(
    appconfig.db.mongo.url,
    appconfig.db.mongo.user,
    appconfig.db.mongo.password,
    appconfig.db.mongo.dbname,
    appconfig.db.mongo.secure).getConnection();