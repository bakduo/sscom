import { SchemaNode } from './../schemas/node-schema';
import { IGenericDB, IsearchItem } from '../datasource/storage/generic';
import { NodeDTO } from '../dto/node';
import { INode } from './fdao';
import { errorGenericType } from '../interfaces/error';
import { IMongoConnect } from '../datasource/storage/mongo';
import { loggerApp } from '../initconfig/configure';
import { Model, Connection } from 'mongoose';
import { IKeyValue } from '../interfaces';

class NoNode implements INode {

    name?: string;
    uuid: string;
    email?: string;
    deleted?: boolean;
    timestamp: number;

    constructor(){
        this.uuid = '';
        this.timestamp = -1;
    }

    getUuid():string{
        return this.uuid;
    }
}

export class MongoNodeDAO implements IGenericDB<NodeDTO> {
    
    model: Model<INode>;

    private static instance: MongoNodeDAO;

    private constructor(_connection:Connection){
        try {

            this.model = _connection.model<INode>('Node',SchemaNode);

        } catch (error:unknown) {
            const err = error as errorGenericType;
            loggerApp.error(`Exception on constructor into MongoDB: ${err.message}`);
            throw new Error("Error to Generated MongoNodeDAO");
        }
    }

    getType(): string {
        return "mongo";
    }

    public static getInstance(mongoconnect:IMongoConnect): MongoNodeDAO {
        if (!MongoNodeDAO.instance) {
            MongoNodeDAO.instance = new MongoNodeDAO(mongoconnect.getConnection());

        }

        return MongoNodeDAO.instance;
    }

    async findOne (custom: IsearchItem):Promise<NodeDTO> {

        const {keycustom, valuecustom} = custom;

        const queryObj:IKeyValue = {};

        queryObj[keycustom] = valuecustom;

        try {
            const item = await this.model.findOne(queryObj);
            if (item){
                const {uuid} = item;
    
                return {uuid};
            }    
        } catch (error) {
            const err = error as errorGenericType;
            throw new Error(`Exception on findOne ${err.message}`);
        }

        const noitem = new NoNode();

        return {uuid:noitem.getUuid()};

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

    async saveOne(item: NodeDTO): Promise<NodeDTO>{

            const mItem = {
                timestamp:Math.floor(Date.now() / 1000),
                ...item
            }
            
            try {

                const newItem = await this.model.create(mItem);

                if (newItem){
                   
                    const {uuid} = newItem;

                    return {uuid};

                }    
                
                throw new Error(`Exception on create into MongoDB`);

            } catch (error:unknown) {
                const err = error as errorGenericType;
                loggerApp.error(`Exception on saveOne into MongoDB: ${err.message}`);
                throw new Error(`Exception on saveOne into MongoDB`);
            }
    }

    async getAll(): Promise<NodeDTO[]> {
        
        const allItems = await this.model.find();

        if (allItems){

            return allItems.map((item)=> {

                const {uuid}  = item;

                return {uuid};

            });
        }

        return [];
    }

    async updateOne(id: string, item: NodeDTO): Promise<NodeDTO> {


            const newItem = {
                ...item,
                timestamp:  Math.floor(Date.now() / 1000)
            };

            try {
                const updateItem = await this.model.findOneAndUpdate({_id:id},newItem);

                if (updateItem){
                    const {uuid} = updateItem;
                    return {uuid};
                }
            } catch (error) {
                const err = error as errorGenericType;
                loggerApp.error(`Exception on saveOne into MongoDB: ${err.message}`);
                throw new Error(`Exception on saveOne into MongoDB`);
            }
            
            const noitem = new NoNode();

            return {uuid:noitem.getUuid()};
    }

    async deleteAll(): Promise<void> {
        await this.model.deleteMany();
    }

}