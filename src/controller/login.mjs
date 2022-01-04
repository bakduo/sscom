import * as code from '../config/status.mjs';

export default class LoginController {

    constructor(dao,daocredential){
        this.user = dao;
        this.credential = daocredential;
    }

    login = async (req,res,next) =>{
        const {username,password } = req.body;

        return res.status(200).json({message:{data:{token:'asdadsddsaasdsadsa'},code:code.OK_UPDATE}});

    }

    saveSecureCredential = async (credentialBody) => {
        try {
            const user = await this.credential.save(credentialBody);
            if (user){
                return user;
            }
            return false;
        } catch (error) {
            return false;
        }
    }

    saveSecureUser = async (userBody) => {
        try {
            const userNew = await this.user.save(userBody);
            if (userNew){
                return userNew;
            }
            return false;
        } catch (error) {
            return false;
        }
    }

    deleteSecureUser = async (email)=>{
        try {
            const foundUser = await this.user.findByEmail(email);
            const deleted = await this.user.deleteOne(foundUser.id);
            if (deleted){
                return deleted;
            }
            return false;
        } catch (error) {
            return false;
        }
    }

    signup = async (req,res,next) => {

        const {name, surname, age, email, password} = req.body;

        //TODO FIX transatioal
        const userNew = this.saveSecureUser({name, surname, age, email});
        userNew.then((stateUser)=>{
            if (stateUser){
                return stateUser
            }
            return false;
        })
        .then((user)=>{

            if (user){
                const credentialNew = this.saveSecureCredential({email:user.email,password:password});
                credentialNew.then((stateCredential)=>{
                    if (stateCredential){
                        return res.status(201).json({message:{data:{email:stateCredential.email},code:code.OK_UPDATE}});        
                    }else{
                        //TODO FIX
                        if (this.deleteSecureUser(user.email)){
                            return res.status(400).json({message:{data:{error:error.message},code:code.ERROR_CREDENTIAL_PAYLOAD}});
                        }else{
                            return res.status(400).json({message:{data:{error:'Fail deleted user'},code:code.ERROR_PERSISTEN_USER}});
                        }
                    }
                })
                .catch((error)=>{
                    //TODO FIX
                    if (this.deleteSecureUser(user.email)){
                        return res.status(400).json({message:{data:{error:error.message},code:code.ERROR_CREDENTIAL_PAYLOAD}});
                    }else{
                        return res.status(400).json({message:{data:{error:'Fail deleted user'},code:code.ERROR_PERSISTEN_USER}});
                    }
                })
            }else{
                return res.status(400).json({message:{data:{error:'Invalid user'},code:code.ERROR_USER_PAYLOAD}});
            }
        })
        .catch((error)=>{
            console.log(error);
            return res.status(400).json({message:{data:{},code:code.ERROR_PAYLOAD}});
        });
        
    }
}