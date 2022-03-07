import { isValidToken } from './../util/validToken';
import {Request, Response, NextFunction} from 'express';
import { IUserToken } from '../interfaces/custom';
import { MongoUserRemoteDao } from '../dao/storage/user-remote';
import { isValidUser } from '../util/validuser';
import { MongoTokenDao } from '../dao/storage/token';
import { errorGenericType } from '../interfaces/error';
import { ERRORS_APP, loggerApp } from '../init/configure';
import { ETokenInvalid } from '../middleware/check-sign-token';


export class ControllerServiceAuth {


    search = async (req:Request,res:Response,next:NextFunction)=>{

        const {email,remoteuser,password,roles} = req.body;

        const genericUser = MongoUserRemoteDao.getInstance();

        const encontrado = await genericUser.findOne({keycustom:'email',valuecustom:email.toLowerCase()});

        if (isValidUser(encontrado)){
            res.status(200).json(encontrado);
        }

        res.status(404).json({message:'user not found'});
    }


    delete = async (req:Request,res:Response,next:NextFunction)=>{

        const {email} = req.body;

        const genericUser = MongoUserRemoteDao.getInstance();

        const encontrado = await genericUser.deleteOne({keycustom:'email',valuecustom:email.toLowerCase()});

        if (encontrado){
            res.status(200).json({message:'User Deleted'});
        }

        res.status(404).json({message:'user not found'});
    }

    postLogin = async (req:Request,res:Response,next:NextFunction) => {
        //logger.debug('login paso');
        if (req.user) {

            const user = req.user as IUserToken;

            return res.status(200).json({ SUCCESS: true, token: user.token, refresh: user.refreshtoken, fail: false });
        }
        return res.status(401).json({ SUCCESS: false, fail: 'Error al realizar post login' });
    };
 
    postLogout = async (req:Request,res:Response,next:NextFunction) =>{

        const { token } = req.body;

        const daorefresh = MongoTokenDao.getInstance();

        const existe = await daorefresh.findOne({keycustom:'token',valuecustom:token});

        if (isValidToken(existe)){
            daorefresh.deleteOne({keycustom:'token',valuecustom:token})
            .then((status)=>{

                if (status){
                    return  res.status(200).json({message:"Logout successful"});
                }
                return  res.status(404).json({message:"Logout don't found token for delete"});
            })
            .catch((error)=>{
                const err = error as errorGenericType;
                loggerApp.error(`Exception on postLogout into jwt.deleteOne: ${err.message}`);
                return next(new ETokenInvalid(`Token Invalid user ${err.message}`,ERRORS_APP.ETokenInvalid.code,ERRORS_APP.ETokenInvalid.HttpStatusCode));
            })
        }
     
    }

    postSignup = async (req:Request,res:Response,next:NextFunction) =>{

        try {
            const user = req.user as IUserToken;

            return res.status(200).json({profile:user});
        } catch (error) {
            next(error);
        }
        
    }

    showProfile = async (req:Request,res:Response,next:NextFunction)=>{
        
        try {
            const user = req.user as IUserToken;

            return res.status(200).json({profile:user});
        } catch (error) {
            next(error);
        }
    }
}