
import { IUserDTO } from '../dto/userDTO';

export const isValidUser = (user:IUserDTO):boolean =>{
  
    if (user.email.length===0 || user.roles.length===0){
      return false;
    }

    return true;
}