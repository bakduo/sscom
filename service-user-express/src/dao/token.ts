import { SchemaToken } from './../schemas/token';
import { Model, Connection } from 'mongoose';
import { ITokenDTO } from '../dto/tokenDTO';
import { loggerApp } from '../init/configure';
import { IGenericDB, IsearchItem } from "./generic";
import { IToken } from './IToken';
import { errorGenericType } from '../interfaces';
import { IKeyValue } from '../interfaces/custom';
import { IMongoConnect } from '../datastore';

class NoToken implements IToken {

    token: string;
    date: number;
    timestamp: number;

    constructor(){
        this.token = '';
        this.date = -1;
        this.timestamp = -1;
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
            const item = await this.model.findOne(queryObj);
            
            if (item){
                const {token} = item;
    
                return {token};
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
                   
                    const {token} = newItem;

                    return {token};

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
                const {token,date}  = item;

                return {token,date};
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
                
                    const {token} = updateItem;
    
                    return {token};
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
        await this.model.deleteMany();
    }

}

    