import { IGenericDB, IsearchItem } from '../datasource/storage/generic';
import { NodeDTO } from '../dto/node';
import { INode } from './fdao';

export class MemoryNodeDAO implements IGenericDB<NodeDTO>{

    private items:INode[] = [];
    constructor(){
        this.items = [];
    }

    getType(): string {
        return "memory";
    }

    getAll(): Promise<NodeDTO[]> {
        return Promise.resolve(this.items);
    }

    findOne(custom: IsearchItem): Promise<NodeDTO> {

        const {valuecustom} = custom;

        const existe = this.items.find((item)=>item.uuid === valuecustom);
        if (existe){
            return Promise.resolve(existe);
        }
        
        return Promise.resolve({uuid:''});
    }

    async deleteOne(custom: IsearchItem): Promise<boolean> {
        const {valuecustom} = custom;
        const existe = await this.findOne(custom);
        if (existe.uuid==valuecustom){
            this.items = this.items.filter((item)=>item.uuid!==valuecustom);
            return Promise.resolve(true);
        }
        
        return Promise.resolve(false);
    }

    saveOne(item: NodeDTO): Promise<NodeDTO> {

        const newItem = {
            ...item,
            timestamp: Math.floor(Date.now() / 1000)
        }

        this.items.push(newItem);
        
        return Promise.resolve(item);
    }

    updateOne(id: string, item: NodeDTO): Promise<NodeDTO> {
        
        const position = this.items.findIndex((item)=>item.uuid === id);

        if (position>-1){
            const updateItem = {
                ...item,
                timestamp: Math.floor(Date.now() / 1000)
            }
            this.items[position] = updateItem;
            return Promise.resolve(this.items[position]);
        }
        
        return Promise.resolve({uuid:''});
        
    
    }

    async deleteAll(): Promise<void> {
       this.items = [];
    }

}