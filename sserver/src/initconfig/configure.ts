import { FDAO } from './../dao';
import config from 'config';
import { CipherPayload, CipherBrowserPayload } from '../utils/cipher';
import childProcess from 'child_process';
import pino from "pino";
import stream from 'stream';
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
    name: 'sserver',
    level: 'debug'
},
logThrough
);


export interface IConfigure {
    port:number;
    
    secure:boolean;

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

    encrypt:{
        algorithm:string;
        secretKey:string;
        iv?:string;
    },

    persistence:{
        type:string;
        mongo:boolean;
        memory:boolean;
    }
}

export const appconfig:IConfigure = config.get('app');

export const encrypt= new CipherPayload({
    algorithm:appconfig.encrypt.algorithm,
    secretKey:appconfig.encrypt.secretKey
});

export const encryptBrowser = new CipherBrowserPayload({
    algorithm:appconfig.encrypt.algorithm,
    secretKey:appconfig.encrypt.secretKey
});

export const nodeDAO = FDAO.getInstance(appconfig.persistence.type).get("node");

