
import { Model, Connection } from 'mongoose';
import { IMongoConnect } from '../datastore';
import { ITokenDTO } from '../dto';
import { loggerApp } from '../init';
import { errorGenericType, IKeyValue } from '../interfaces';
import { SchemaToken } from '../schemas';
import { IGenericDB, IsearchItem } from './generic';
import { IToken } from './IToken';

export class NoToken implements IToken {

    token: string;
    date: number;
    timestamp: number;
    tmptoken: string;
    email?: string;
    username?: string;

    constructor(){
        this.token = '';
        this.date = -1;
        this.timestamp = -1;
        this.tmptoken = '';
        this.email = '';
        this.username = '';
    }
}

export class MongoTokenDao implements IGenericDB<ITokenDTO> {

    model: Model<IToken>;

    private static instance: MongoTokenDao;

    private constructor(_connection:Connection){
        try {

            this.model = _connection.model<IToken>('Token',SchemaToken);

        } catch (error:unknown) {
            const err = error as errorGenericType;
            loggerApp.error(`Exception on constructor into MongoTokenDao: ${err.message}`);
            throw new Error("Error to Generated MongoTokenDao");
        }
    }

    public static getInstance(mongoconnect:IMongoConnect): MongoTokenDao {
        if (!MongoTokenDao.instance) {
            MongoTokenDao.instance = new MongoTokenDao(mongoconnect.getConnection());
        }

        return MongoTokenDao.instance;
    }

    async findOne (custom: IsearchItem):Promise<ITokenDTO> {

        const {keycustom, valuecustom} = custom;

        const queryObj:IKeyValue = {};

        queryObj[keycustom] = valuecustom;

        try {
            const item = await this.model.findOne(queryObj) || false;
            
            if (item){
                const {token,tmptoken,email,username} = item;
    
                return {token,tmptoken,email,username};
            }    
        } catch (error) {
            const err = error as errorGenericType;
            throw new Error(`Exception on findOne ${err.message}`);
        }

        return new NoToken();
    }

    async deleteOne(custom: IsearchItem): Promise<boolean> {

        const {keycustom, valuecustom} = custom;

        const queryObj:IKeyValue = {};

        queryObj[keycustom] = valuecustom;

        try {
            const item = await this.model.deleteOne(queryObj);

            if (item){
                if (item.deletedCount>0){
                    return true
                }
            }    
        } catch (error) {
            const err = error as errorGenericType;
            throw new Error(`Exception on deleteOne ${err.message}`);
        }
    
        return false;

    }

    async saveOne(item: ITokenDTO): Promise<ITokenDTO>{

            try {

                const mItem = {
                    date:Math.floor(Date.now()/1000),
                    ...item
                }

                const newItem:IToken = await this.model.create(mItem);

                if (newItem){
                   
                    const {token,email,tmptoken,username} = newItem;

                    return {token,email,tmptoken,username};

                }    
                
                throw new Error(`Exception on create into MongoDB`);

            } catch (error:unknown) {
                const err = error as errorGenericType;
                loggerApp.error(`Exception on saveOne into MongoDB: ${err.message}`);
                throw new Error(`Exception on saveOne into MongoDB ${err.message}`);
            }
    }

    async getAll(): Promise<ITokenDTO[]|[]> {
        
        const allItems = await this.model.find();
        if (allItems){
            return allItems.map((item)=> {
                const {token,email,date,tmptoken,username}  = item;

                return {token,email,date,tmptoken,username};
            });
        }

        return [];
    }

    async updateOne(token: string, item: ITokenDTO): Promise<ITokenDTO> {

        const mItem = {
            date:Math.floor(Date.now()/1000),
            ...item
        }

        const existe = await this.model.findOne({"token":token});

        if (existe){

            const updateItem = await this.model.findByIdAndUpdate(existe._id,mItem);

            try {
                if (updateItem){
                
                    const {token,email,tmptoken,username} = updateItem;
    
                    return {token,email,tmptoken,username};
                }
            } catch (error) {
                const err = error as errorGenericType;
                loggerApp.error(`Exception on updateOne into MongoDB: ${err.message}`);
                throw new Error(`Exception on updateOne into MongoDB ${err.message}`);
            }
        }
        
        return new NoToken();
    
}

    async deleteAll(): Promise<void> {
        await this.model.deleteMany({});
    }

}