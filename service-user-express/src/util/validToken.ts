
import { ITokenDTO } from '../dto/tokenDTO';
import jwt from 'jsonwebtoken';
import { appconfig} from '../init/configure';
import { ITokenDecode } from '../interfaces/custom';


export const isValidToken = (tokenRemote:ITokenDTO):boolean =>{

  
    if (tokenRemote.token.length<=0){
      return false;
    }
    
    return true;
}

export const checkRealToken = (token:string) => {

    const decoded = jwt.verify(token, appconfig.jwt.secret);
  
    const {id, roles} = decoded as ITokenDecode;
  
    return {id, roles};

}

