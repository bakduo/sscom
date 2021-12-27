import GenericDAO from "./generic.mjs";

import UserDTO from "../dto/user.mjs";

export default class UserDAO extends GenericDAO {
    
    #sas

    constructor(storageStragegy){
        super();
        this.#sas = storageStragegy;
    }

    save = async ({name, surname, age, email}) => {
        try {
            if (UserDTO.validate({name, surname, age, email})){
                const userJson = new UserDTO({name, surname, age, email}).toJson();
                await this.#sas.save(userJson);
                return userJson;
            }
            throw new Error(`User invalid`);
        } catch (error) {
            throw new Error(`Error to process save ${error.message}`);
        }
    }

    findOne = async (id) => {
        const user = await this.#sas.findOne(id);
        if (user){
            return new UserDTO(user).toJson();
        }
        return false
    }

    updateOne= async (id,{name, surname, age, email}) => {
        try {
            if (UserDTO.validate({name, surname, age, email})){
                const user  = await this.#sas.updateOne(id,{name, surname, age, email});
                return new UserDTO(user).toJson();
            }
            throw new Error(`Update invalid`);
        } catch (error) {
            throw new Error(`Error to process updateOne ${error.message}`);
        }
    }

    deleteOne= async (id) => {
        try {
            const existe = await this.findOne(id);
            if (existe){
                const item = await this.#sas.deleteOne(id);
                return item;
            }
            return false;
        } catch (error) {
            throw new Error(`Error to process deleteOne ${error.message}`);
        }
        
    }

    getAll = async () => {
        const items = await this.#sas.getAll();
        const allUsers = items.map((item)=>{
            const {name, surname, age, email} = item;
            const newUser = new UserDTO({name, surname, age, email}).toJson();
            return newUser;
        });
        
        return allUsers;
    }
}