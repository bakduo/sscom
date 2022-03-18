import { appconfig } from '../initconfig/configure';
import { MongoNodeDAO } from './node-mongo';
import { MemoryNodeDAO } from './node-memory';
import MongoConnect from '../datasource/storage/mongo';
import { IGenericDB } from '../datasource/storage/generic';
import { NodeDTO } from '../dto/node';

export interface INode {
    name?:string;
    uuid:string;
    email?:string;
    deleted?:boolean;
    timestamp:number;
}

export class FDAO {

    type:string;

    private static instance:FDAO

    private constructor(_type:string){
        this.type = _type;
    }

    static getInstance(type:string):FDAO{
        if (!FDAO.instance){
            FDAO.instance = new FDAO(type);
            return FDAO.instance;
        }

        return FDAO.instance;
    }

    get(name:string):IGenericDB<NodeDTO>{

        let newDAO;

        if (name==='node'){
            switch (this.type) {
                case "mongo":
                    newDAO = MongoNodeDAO.getInstance(MongoConnect.getInstance(
                        appconfig.db.mongo.url,
                        appconfig.db.mongo.user,
                        appconfig.db.mongo.password,
                        appconfig.db.mongo.dbname,
                        appconfig.db.mongo.secure,
                        appconfig.persistence.mongo));
                        break;
                default:
                    newDAO = new MemoryNodeDAO();
                    break;
            }

            if (newDAO){
                return newDAO;
            }
        }

        throw new Error(`Don't exists DAO for: ${name}`);
     
    }

}

