import GenericDAO from "./generic.mjs";

import CredentialDTO from "../dto/credential.mjs";

export default class CredentialDAO extends GenericDAO {
    
    #sas

    constructor(storageStragegy){
        super();
        this.#sas = storageStragegy;
    }

    save = async ({email,password}) => {
        try {
            if (CredentialDTO.validate({email,password})){
                const userJson = new CredentialDTO({email,password}).toJson();
                await this.#sas.save(userJson);
                return userJson;
            }
            throw new Error(`Credential invalid`);
        } catch (error) {
            throw new Error(`Error to process save ${error.message}`);
        }
    }

    findOne = async (id) => {
        const user = await this.#sas.findOne(id);
        if (user){
            return new CredentialDTO(user).toJson();
        }
        return false
    }

    updateOne= async (id,{email,password}) => {
        try {
            if (UserDTO.validate({email,password})){
                const user  = await this.#sas.updateOne(id,{email,password});
                return new CredentialDTO(user).toJson();
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
            const {email,password} = item;
            const newUser = new CredentialDTO({email,password}).toJson();
            return newUser;
        });
        
        return allUsers;
    }
}