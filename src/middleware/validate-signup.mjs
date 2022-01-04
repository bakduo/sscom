import Joi from "joi";

import * as code from '../config/status.mjs';

const validateSignupPayload = (req,res,next) => {

        const user = req.body;

        const JoiSchema = Joi.object({
            age: Joi.number().required(),
            email:Joi.string().min(6).required(),
            name:Joi.string().min(3).max(30).required(),
            surname:Joi.string().min(3).max(30).required(),
            password:Joi.string().min(8).max(90).required(),
        }).options({ abortEarly: false });
    
        const status = JoiSchema.validate(user);
        if (status.error){
            return res.status(400).json({message:{data:{},code:code.ERROR_PAYLOAD}})
        }
        return next();
}

export {validateSignupPayload}