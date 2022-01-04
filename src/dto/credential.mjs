import Joi from "joi"

export default class CredentialDTO {

    #password
    #email
    
    constructor({email,password}){
        
        this.#email = email;
        this.#password = password;
    }

    static validate(user){

        const JoiSchema = Joi.object({
            email:Joi.string().min(6).required(),
            password:Joi.string().min(3).max(30).required(),
        }).options({ abortEarly: false });

        const status = JoiSchema.validate(user);
        if (status.error){
            return false;
        }
        return true;
    }

    
    setEmail(email){
        this.#email = email;
    }

    setPassword(pass){
        this.#password = pass;
    }

    getEmail(){
        return this.#email;
    }

    getPassword(){
        return this.#password
    }

    toJson(){
        
        const newObj = {
             password: this.#password,
             email:this.#email
         };
 
         return newObj;
     }

}