
import { ITokenDTO } from '../dto/tokenDTO';

export const isValidToken = (tokenRemote:ITokenDTO):boolean =>{

  
    if (tokenRemote.token.length===0){
      return false;
    }
    
    return true;
}