export interface IsearchItem {
    [keycustom:string]:string | number,
    valuecustom:string | number
}

export interface IGenericDB<T> {
  
    getType():string;

    getAll():Promise<T[]>
  
    findOne(custom:IsearchItem):Promise<T>;
    
    deleteOne(custom:IsearchItem):Promise<boolean>;
    
    saveOne(item:T):Promise<T>;
    
    updateOne(id:string,item:T):Promise<T>;

    deleteAll():Promise<void>;

}