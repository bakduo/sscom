import { Model } from 'mongoose';
import { IToken } from "../IToken";
import { IGenericDB, IsearchItem } from "./generic";
import { SchemaToken } from '../../schemas/token';
import { connectionDB, loggerApp } from "../../init/configure";
import { errorGenericType } from "../../interfaces";
import { IKeyValue } from '../../interfaces/custom';
import { ITokenDTO } from '../../dto/tokenDTO';

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

export class MongoTokenDao implements IGenericDB<IToken|ITokenDTO> {

    model: Model<IToken>;

    private static instance: MongoTokenDao;

    private constructor(){
        try {

            this.model = connectionDB.model<IToken>('Token',SchemaToken);

        } catch (error:unknown) {
            const err = error as errorGenericType;
            loggerApp.error(`Exception on constructor into MongoTokenDao: ${err.message}`);
            throw new Error("Error to Generated MongoTokenDao");
        }
    }

    public static getInstance(): MongoTokenDao {
        if (!MongoTokenDao.instance) {
            MongoTokenDao.instance = new MongoTokenDao();
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
                    timestamp:Date.now(),
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
                throw new Error(`Exception on saveOne into MongoDB`);
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

    async updateOne(id: string, item: IToken): Promise<ITokenDTO> {


            const updateItem = await this.model.findOneAndUpdate({_id:id},item);

            try {
                if (updateItem){
                    const {token,date} = updateItem;
    
                    return {token,date};
                }    
            } catch (error) {
                const err = error as errorGenericType;
                loggerApp.error(`Exception on saveOne into MongoDB: ${err.message}`);
                throw new Error(`Exception on saveOne into MongoDB`);
            }
            
            return new NoToken();
        
    }

    async deleteAll(): Promise<void> {
        await this.model.deleteMany();
    }

}

    