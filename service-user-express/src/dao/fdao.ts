import MongoConnect from '../datastore/wmongo';
import { IUserDTO } from '../dto/userDTO';
import { appconfig } from '../init/configure';
import { IGenericDB } from './generic';
import { MongoUserRemoteDao } from './user-remote';
import { ITokenDTO } from '../dto/tokenDTO';
import { MongoTokenDao } from './token';

export class FUserDAO {

    type:string;

    private static instance:FUserDAO;

    private constructor(_type:string){
        this.type = _type;
    }

    static getInstance(type:string):FUserDAO{
        if (!FUserDAO.instance){
            FUserDAO.instance = new FUserDAO(type);
            return FUserDAO.instance;
        }

        return FUserDAO.instance;
    }

    build():IGenericDB<IUserDTO>{

        let newDAO;

        switch (this.type) {

            case "mongo":
                newDAO = MongoUserRemoteDao.getInstance(MongoConnect.getInstance(
                    appconfig.db.mongo.url,
                    appconfig.db.mongo.user,
                    appconfig.db.mongo.password,
                    appconfig.db.mongo.dbname,
                    appconfig.db.mongo.secure,
                    appconfig.persistence.mongo));
                    break;
                
        }

        if (newDAO){
            return newDAO;
        }

        throw new Error(`Don't exists DAO for: ${newDAO}`);
     
    }

}

export class FTokenDAO {

    type:string;

    private static instance:FTokenDAO;

    private constructor(_type:string){
        this.type = _type;
    }

    static getInstance(type:string):FTokenDAO{
        if (!FTokenDAO.instance){
            FTokenDAO.instance = new FTokenDAO(type);
            return FTokenDAO.instance;
        }

        return FTokenDAO.instance;
    }

    build():IGenericDB<ITokenDTO>{

        let newDAO;

        switch (this.type) {

            case "mongo":
                newDAO = MongoTokenDao.getInstance(MongoConnect.getInstance(
                    appconfig.db.mongo.url,
                    appconfig.db.mongo.user,
                    appconfig.db.mongo.password,
                    appconfig.db.mongo.dbname,
                    appconfig.db.mongo.secure,
                    appconfig.persistence.mongo));
                    break;
        }
    
        if (newDAO){
            return newDAO;
        }

        throw new Error(`Don't exists DAO for: ${newDAO}`);
     
    }

}