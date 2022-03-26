
import { IUserDTO } from '../dto/userDTO';

import * as Joi from 'joi';

export const isValidUser = (user:IUserDTO):boolean =>{
      
    if (user.email.length===0 || user.roles.length===0){
      return false;
    }

    return true;
}


export const validateUser = (user:IUserDTO) => {
  
  const schema = Joi.object({
    username: Joi.string().min(3).max(255).required(),
    email: Joi.string().email().required(),
    roles: Joi.array().min(1).required(),
    deleted: Joi.boolean().required(),
    password:Joi.string().min(4).max(255).required(),
  });

  return schema.validate(user);

};
