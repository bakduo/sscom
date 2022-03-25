import { SchemaUserRemote } from './../schemas/user-remote';
import { IGenericDB, IsearchItem, IPassword } from './generic';
import { Model, Connection } from 'mongoose';
import { IPasswordDTO, IUserDTO } from '../dto/userDTO';
import { loggerApp } from '../init/configure';
import { errorGenericType } from '../interfaces';
import { IKeyValue } from '../interfaces/custom';
import { IMongoConnect } from '../datastore';
import { IUserRemote } from './Iuser-remote';

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
    username:string;
    password: string;
    roles: string[];
    _id?:string | undefined;

    constructor(){
        this.email = '';
        this.deleted = false;
        this.password = '';
        this.roles = [];
        this.username = '';
    }
   
}

export class MongoUserRemoteDao implements IGenericDB<IUserDTO> {
    
    model: Model<IUserRemote>;

    private static instance: MongoUserRemoteDao;

    private constructor(_connection:Connection){
        try {

            this.model = _connection.model<IUserRemote>('UserRemote',SchemaUserRemote);

        } catch (error:unknown) {
            const err = error as errorGenericType;
            loggerApp.error(`Exception on constructor into MongoDB: ${err.message}`);
            throw new Error("Error to Generated MLinkUser");
        }
    }

    getType(): string {
        return "mongo";
    }

    public static getInstance(mongoconnect:IMongoConnect): MongoUserRemoteDao {
        if (!MongoUserRemoteDao.instance) {
            MongoUserRemoteDao.instance = new MongoUserRemoteDao(mongoconnect.getConnection());
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
                const {email,deleted,username,password,roles} = item;
    
                return {email,deleted,username,password,roles};
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
                    timestamp:Math.floor(Date.now()/1000),
                    ...item
                }

                const newItem:IUserRemote = await this.model.create(mItem);

                if (newItem){
                   
                    const {email,deleted,username,password,roles} = newItem;

                    return {email,deleted,username,password,roles};

                }    
                
                throw new Error(`Exception on create into MongoDB`);

            } catch (error:unknown) {
                const err = error as errorGenericType;
                loggerApp.error(`Exception on saveOne into MongoDB: ${err.message}`);
                throw new Error(`Exception on saveOne into MongoDB ${err.message} `);
            }
    }

    async getAll(): Promise<IUserDTO[]|[]> {
        
        const allItems = await this.model.find();
        if (allItems){
            return allItems.map((item)=> {
                const {email,deleted,username,password,roles}  = item;

                return {email,deleted,username,password,roles};
            });
        }

        return [];
    }

    async updateOne(email: string, item: IUserDTO): Promise<IUserDTO> {

            const mItem = {
                timestamp:Math.floor(Date.now()/1000),
                ...item
            }

            const existe = await this.model.findOne({"email":email});

            if (existe){

                const updateItem = await this.model.findByIdAndUpdate(existe._id,mItem);

                try {
                    if (updateItem){
                    
                        const {email,deleted,username,password,roles} = updateItem;
        
                        return {email,deleted,username,password,roles};
                    }
                } catch (error) {
                    const err = error as errorGenericType;
                    loggerApp.error(`Exception on updateOne into MongoDB: ${err.message}`);
                    throw new Error(`Exception on updateOne into MongoDB ${err.message}`);
                }
            }
            
            return new NoUserRemote();
        
    }

    async deleteAll(): Promise<void> {
        await this.model.deleteMany();
    }

}