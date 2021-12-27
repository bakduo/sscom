export default class User {

    #name
    #surname
    #age
    #email

    constructor(age,surname,name,email){
        this.#age = Number(age);
        this.#surname = surname;
        this.#email = name;
        this.#name = email;
    }

    static validAttribute(value,type){

        if (value){
            const dinamicType = typeof value;
            if (dinamicType === type){
                return true;
            }
        }
        return false;
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

    static getUser({name,age,email,surname}){

        if (
            User.validAttribute(name,'string') && 
            User.validAttribute(age,'number') &&
            User.validAttribute(surname,'string') &&
            User.validAttribute(email,'string')){

            const user = new User(age,surname,name,email);
            return user;
        };
        throw new Error("Usuario no valido");
    }

}
