export default class GenericStorage {
    
    findOne = async (id)=>{
        throw new Error('Implement concrete class');
    }
    
    getAll = async ()=>{
        throw new Error('Implement concrete class');
    }

    save = async (body)=>{
        throw new Error('Implement concrete class');
    }

    findByParam = async (param,value) => {
        throw new Error('Implement concrete class');
    }

    updateOne = async (key,body)=>{
        throw new Error('Implement concrete class');
    }

    deleteOne = async (key)=>{
        throw new Error('Implement concrete class');
    }
}