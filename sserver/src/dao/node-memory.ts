import { IGenericDB, IsearchItem } from '../datasource/storage/generic';
import { INode } from './node';

export class NodeMemoryDAO implements IGenericDB<INode>{

    private items:INode[] = [];
    constructor(){
        this.items = [];
    }

    getType(): string {
        return "memory";
    }

    getAll(): Promise<INode[]> {
        return Promise.resolve(this.items);
    }

    findOne(custom: IsearchItem): Promise<INode> {

        const {valuecustom} = custom;

        const existe = this.items.find((item)=>item.name === valuecustom);
        if (existe){
            return Promise.resolve(existe);
        }
        
        return Promise.resolve({name:''});
    }

    async deleteOne(custom: IsearchItem): Promise<boolean> {
        const {valuecustom} = custom;
        const existe = await this.findOne(custom);
        if (existe.name==valuecustom){
            this.items = this.items.filter((item)=>item.name!==valuecustom);
            return Promise.resolve(true);
        }
        
        return Promise.resolve(false);
    }

    saveOne(item: INode): Promise<INode> {

        this.items.push(item);
        
        return Promise.resolve(item);
    }

    updateOne(id: string, item: INode): Promise<INode> {
        const position = this.items.findIndex((item)=>item.name === id);

        if (position>-1){
            this.items[position] = item;
            return Promise.resolve(this.items[position]);
        }
        
        return Promise.resolve({'name':''});
        
    
    }

    async deleteAll(): Promise<void> {
       this.items = [];
    }

}