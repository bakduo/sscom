
import express from 'express';

import { ControllerServiceAuth } from '../controller/service-user';

import passport from 'passport';

import {Request, Response, NextFunction} from 'express';

import { initPassport } from '../middleware/passport';

import { errorTypeMiddleware } from '../interfaces/error';
import { checkForRefreshToken, checkToken } from '../middleware/check-sign-token';

export const routerGlobal = express.Router();

initPassport();

const controller = new ControllerServiceAuth();

routerGlobal.post('/login',passport.authenticate('login',{'failureRedirect':'/faillogin'}),controller.postLogin);

routerGlobal.post('/logout',controller.postLogout);

routerGlobal.post('/find',controller.search);

routerGlobal.delete('/delete',controller.delete);

routerGlobal.post('/signup',passport.authenticate('signup',{'failureRedirect':'/failsignup'}),controller.postSignup);

routerGlobal.get('/failsignup',(err:errorTypeMiddleware,req:Request,res:Response,next:NextFunction)=>{
    next(err);
});

routerGlobal.get('/faillogin',(err:errorTypeMiddleware,req:Request,res:Response,next:NextFunction)=>{
    next(err);
});

routerGlobal.get('/profile',checkToken,controller.showProfile);

routerGlobal.post('/token',checkForRefreshToken,controller.showProfile);

