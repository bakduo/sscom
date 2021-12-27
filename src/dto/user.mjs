import Joi from "joi"

export default class UserDTO {

    #name
    #surname
    #age
    #email
    
    constructor({name, surname, age, email}){
        
        this.#age = Number(age);
        this.#surname = surname;
        this.#email = email;
        this.#name = name;
    }

    static validate(user){

        const JoiSchema = Joi.object({
            age: Joi.number().required(),
            email:Joi.string().min(6).required(),
            name:Joi.string().min(3).max(30).required(),
            surname:Joi.string().min(3).max(30).required(),
        }).options({ abortEarly: false });

        const status = JoiSchema.validate(user);
        if (status.error){
            return false;
        }
        return true;
    }

    setName(name){
        this.#name = name;
    }

    setSurname(surname){
        this.#surname = surname;
    }

    setEmail(email){
        this.#email = email;
    }

    setAge(age){
        this.#age = age;
    }

    getName(){
        return this.#name;
    }

    getAge(){
        return this.#age;
    }

    getEmail(){
        return this.#email;
    }

    getSurname(){
        return this.#surname
    }

    toJson(){
        
        const newObj = {
             name:this.#name,
             surname: this.#surname,
             age:this.#age,
             email:this.#email
         };
 
         return newObj;
     }

}