import { Connection, createConnection } from 'mongoose';

export default class MongoConnect {

    private url:string;

    private connection: Connection;

    private static instance: MongoConnect;

    private constructor(_url:string,_user:string,_pass:string,_dbname:string,_ssl:boolean){
        this.url = _url;
        this.connection = createConnection(this.url, {
            ssl: _ssl,
            dbName:_dbname,
            user:_user,
            pass:_pass
          });
    }

    public static getInstance(_url:string,_user:string,_pass:string,_dbname:string,_ssl:boolean): MongoConnect {
        if (!MongoConnect.instance) {
            MongoConnect.instance = new MongoConnect(_url,_user,_pass,_dbname,_ssl);
        }

        return MongoConnect.instance;
    }
    
    connect():void{

        // const conectar = async () => {
        // }
        // conectar();
    }

    getConnection():Connection{
        return this.connection;
    }
}