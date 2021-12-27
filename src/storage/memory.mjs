import GenericStorage from "./generic.mjs";

import { v1 as uuidv1 } from 'uuid';

export default class MemoryRAM extends GenericStorage {

    #items;

    static instance;
    
    constructor(){

        if(!MemoryRAM.instance){
            super();
            this.#items = [];
            MemoryRAM.instance = this;
        }
        
        return MemoryRAM.instance;
    }

    findOne = async (id)=>{
        const item = this.#items.find((item)=>{ return (item.id===id)});
        if (item){
            return item;
        }
        return false;
    }
    
    getAll = async ()=>{
        return this.#items;
    }

    save = async (body)=>{
        const newItem = {
            id:uuidv1(),
            ...body
        };
        this.#items.push(newItem);
        return body;
    }

    updateOne = async (key,body)=>{
        const itemIndex = this.#items.findIndex((item)=>item.id===key);
        if (itemIndex>=0){
            this.#items[itemIndex] = {
                ...this.#items[itemIndex],
                ...body
            }
            return this.#items[itemIndex];
        }
        return false;
    }

    deleteOne = async (key)=>{
        const item = this.findOne(key);
        if (item){
            this.#items = this.#items.filter((item)=>item.id!==key);
            return key;
        }
        return false;
    }

}