import { isValidToken } from './../util/validToken';
import {Request, Response, NextFunction} from 'express';
import { IUserToken } from '../interfaces/custom';
import { isValidUser } from '../util/validuser';
import { errorGenericType } from '../interfaces/error';
import { ERRORS_APP, loggerApp, userDAO, tokenDAO } from '../init/configure';
import { ETokenInvalid } from '../middleware/check-sign-token';

export class ControllerServiceAuth {


    search = async (req:Request,res:Response,next:NextFunction)=>{

        const user = req.user as IUserToken;

        if (user.roles.includes('admin')){

            const {email,remoteuser,password,roles} = req.body;
    
            const encontrado = await userDAO.findOne({keycustom:'email',valuecustom:email.toLowerCase()});
    
            if (isValidUser(encontrado)){
                res.status(200).json(encontrado);
            }
    
            res.status(404).json({message:'user not found'});
        }

        res.status(401).json({message:'User not have privileges'});
    }


    delete = async (req:Request,res:Response,next:NextFunction)=>{


        const user = req.user as IUserToken;

        if (user.roles.includes('admin')){

            const {email} = req.body;

            const encontrado = await userDAO.deleteOne({keycustom:'email',valuecustom:email.toLowerCase()});
    
            if (encontrado){
                res.status(200).json({message:'User Deleted'});
            }
    
            res.status(404).json({message:'user not found'});
        }

        res.status(401).json({message:'User not have privileges'});
        
    }

    postLogin = async (req:Request,res:Response,next:NextFunction) => {
        
        if (req.user) {

            const user = req.user as IUserToken;

            return res.status(200).json({ token: user.token, refresh: user.refreshtoken, fail: false });
        }
        return res.status(401).json({ fail: 'Error al realizar post login' });
    };
 
    postLogout = async (req:Request,res:Response,next:NextFunction) =>{

        const { token } = req.body;

        const existe = await tokenDAO.findOne({keycustom:'token',valuecustom:token});

        if (isValidToken(existe)){

            try {

                const deleted = await tokenDAO.deleteOne({keycustom:'token',valuecustom:token});
    
                if (deleted){
                    return  res.status(200).json({message:"Logout successful"});
                }
    
                return res.status(404).json({message:"Logout don't found token for delete"});

            }catch(error){

                const err = error as errorGenericType;
                
                loggerApp.error(`Exception on postLogout into jwt.deleteOne: ${err.message}`);
                
                return next(new ETokenInvalid(`Token Invalid user ${err.message}`,ERRORS_APP.ETokenInvalid.code,ERRORS_APP.ETokenInvalid.HttpStatusCode));

            }

            //tokenDAO.deleteOne({keycustom:'token',valuecustom:token})
            // .then((status)=>{
            //     if (status){
            //         return  res.status(200).json({message:"Logout successful"});
            //     }
            //     return  res.status(404).json({message:"Logout don't found token for delete"});
            //})
            // .catch((error)=>{
            //     const err = error as errorGenericType;
            //     loggerApp.error(`Exception on postLogout into jwt.deleteOne: ${err.message}`);
            //     return next(new ETokenInvalid(`Token Invalid user ${err.message}`,ERRORS_APP.ETokenInvalid.code,ERRORS_APP.ETokenInvalid.HttpStatusCode));
            //})

        }

        return  res.status(404).json({message:"Logout don't found token for delete"});
     
    }

    postSignup = async (req:Request,res:Response,next:NextFunction) =>{

        try {
            const user = req.user as IUserToken;

            const {id,roles} = user;

            return res.status(201).json({profile:{id,roles}});
        } catch (error) {
            next(error);
        }
        
    }

    showProfile = async (req:Request,res:Response,next:NextFunction)=>{
        
        try {
            const user = req.user as IUserToken;

            const {id,roles} = user;

            return res.status(200).json({profile:{id,roles}});
        } catch (error) {
            next(error);
        }
    }
}