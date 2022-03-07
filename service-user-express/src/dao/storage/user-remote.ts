import { IGenericDB, IsearchItem, IPassword } from './generic';
import { Model } from 'mongoose';
import { SchemaUserRemote } from '../../schemas/user-remote';
import { connectionDB, loggerApp } from "../../init/configure";
import { errorGenericType } from "../../interfaces";

import { IUserRemote } from "../user-remote";
import { IPasswordDTO, IUserDTO } from '../../dto/userDTO';
import { IKeyValue } from '../../interfaces/custom';

export class MongoUserPassword implements IPassword<IPasswordDTO> {

    model: MongoUserRemoteDao;

    constructor(user:MongoUserRemoteDao){
        this.model = user;
    }

    async findPassword (custom: IsearchItem):Promise<IPasswordDTO> {

       const user  = await this.model.findOne(custom);

       if (user){
        return user;
       }

       throw new Error(`Exception on findPassword into MongoDB`);
    }
}

class NoUserRemote implements IUserDTO {

    email: string;
    deleted: boolean;
    password: string;
    roles: string[];
    _id?:string | undefined;

    constructor(){
        this.email = '';
        this.deleted = false;
        this.password = '';
        this.roles = [];
    }
   
}

export class MongoUserRemoteDao implements IGenericDB<IUserRemote|IUserDTO> {
    
    model: Model<IUserRemote>;

    private static instance: MongoUserRemoteDao;

    private constructor(){
        try {

            this.model = connectionDB.model<IUserRemote>('UserRemote',SchemaUserRemote);

        } catch (error:unknown) {
            const err = error as errorGenericType;
            loggerApp.error(`Exception on constructor into MongoDB: ${err.message}`);
            throw new Error("Error to Generated MLinkUser");
        }
    }

    getType(): string {
        return "mongo";
    }

    public static getInstance(): MongoUserRemoteDao {
        if (!MongoUserRemoteDao.instance) {
            MongoUserRemoteDao.instance = new MongoUserRemoteDao();
        }

        return MongoUserRemoteDao.instance;
    }

    async findOne (custom: IsearchItem):Promise<IUserDTO> {

        const {keycustom, valuecustom} = custom;

        const queryObj:IKeyValue = {};

        queryObj[keycustom] = valuecustom;

        try {
            const item = await this.model.findOne(queryObj);
            if (item){
                const {email,deleted,password,roles} = item;
    
                return {email,deleted,password,roles};
            }    
        } catch (error) {
            const err = error as errorGenericType;
            throw new Error(`Exception on findOne ${err.message}`);
        }

        return new NoUserRemote();
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

    async saveOne(item: IUserDTO): Promise<IUserDTO>{

            try {

                const mItem = {
                    timestamp:Date.now(),
                    ...item
                }

                const newItem:IUserRemote = await this.model.create(mItem);

                if (newItem){
                   
                    const {email,deleted,password,roles} = newItem;

                    return {email,deleted,password,roles};

                }    
                
                throw new Error(`Exception on create into MongoDB`);

            } catch (error:unknown) {
                const err = error as errorGenericType;
                loggerApp.error(`Exception on saveOne into MongoDB: ${err.message}`);
                throw new Error(`Exception on saveOne into MongoDB`);
            }
    }

    async getAll(): Promise<IUserDTO[]|[]> {
        
        const allItems = await this.model.find();
        if (allItems){
            return allItems.map((item)=> {
                const {email,deleted,password,roles}  = item;

                return {email,deleted,password,roles};
            });
        }

        return [];
    }

    async updateOne(id: string, item: IUserRemote): Promise<IUserDTO> {


            const updateItem = await this.model.findOneAndUpdate({_id:id},item);

            try {
                if (updateItem){
                    const {email,deleted,password,roles} = updateItem;
    
                    return {email,deleted,password,roles};
                }    
            } catch (error) {
                const err = error as errorGenericType;
                loggerApp.error(`Exception on saveOne into MongoDB: ${err.message}`);
                throw new Error(`Exception on saveOne into MongoDB`);
            }
            
            return new NoUserRemote();
        
    }

    async deleteAll(): Promise<void> {
        await this.model.deleteMany();
    }

}