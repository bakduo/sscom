
import jwt from 'jsonwebtoken';
import { ITokenDTO } from '../dto';
import { appconfig } from '../init';
import { ITokenDecode } from '../interfaces';

export const isValidToken = (tokenRemote:ITokenDTO):boolean =>{

    if (tokenRemote.token.length<=0){
      return false;
    }
    
    return true;
}

export const checkRealToken = (token:string):ITokenDecode => {

    const decoded = jwt.verify(token, appconfig.jwt.secret);
  
    const {id, roles} = decoded as ITokenDecode;
  
    return {id, roles};

}
