import * as code from '../config/status.mjs';

export default class UserController {

    constructor(dao){
        this.user = dao;
    }

    updateSecure = async (id,body) => {
        try {
            return await this.user.updateOne(id,body);
        } catch (error) {
            console.error(`${error.message}`);
            return false;
        }
    }

    updateOne = async (req,res) => {

        console.log(req.params);
        
        const { id } = req.params;
    
        if (id){
            const userUpdate = await this.updateSecure(id,req.body);
            if (userUpdate){
                return res.status(200).json({message:{data:userUpdate,code:code.OK_UPDATE}});
            }
        }
        return res.status(400).json({message:{data:{},code:code.ERROR_PAYLOAD}});
        
    }

    getAll = async (req,res) => {
        const users = await this.user.getAll();
        return res.status(200).json({message:{data:users,code:code.OK_REQUEST}});
    }

    saveSecure = async (body) => {
        try {
            return await this.user.save(body);
        } catch (error) {
            console.error(`${error.message}`);
            return false;
        }
    }

    save = async (req,res) => {
        
        if (req.body){
            const user = await this.saveSecure(req.body);
            if (user){
                return res.status(201).json({message:{data:user,code:code.OK_ADD}});
            }
        }
        return res.status(400).json({message:{data:{},code:code.ERROR_PAYLOAD}});
        
    };

    deleteOne = async (req,res) => {

        console.log(req.params);
        
        const { id } = req.params;
    
        if (id){
            const userId = await this.user.deleteOne(id);
            if (userId){
                return res.status(200).json({message:{data:userId,code:code.OK_DELETE}});
            }
        }
        return res.status(400).json({message:{data:{},code:code.ERROR_PAYLOAD}});
        
    }

    getOne = async (req,res) => {

        console.log(req.params);
    
        const { id } = req.params;
    
        if (id){
            const user = await this.user.findOne(id);
            if (user){
                return res.status(200).json({message:{data:user,code:code.OK_ADD}});
            }
            return res.status(404).json({message:{data:{},code:code.OK_NOTFOUND}});
        }
        return res.status(400).json({message:{data:{},code:code.ERROR_PAYLOAD}});
        
    }

}