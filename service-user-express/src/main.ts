import express from 'express';

import {Request, Response, NextFunction} from 'express';

import passport from "passport";

import { errorTypeMiddleware } from './interfaces/error';

import { routerGlobal } from './routes/service-user';

export const app = express();

app.disable('x-powered-by');

app.use(express.json({limit: '1mb'}));

app.use(express.urlencoded({ limit: '1mb',extended: true }));

app.use(passport.initialize());

app.use('/api',routerGlobal);


//Handler GET 404 for not found
app.use((req:Request, res:Response)=> {
    return res.status(404).json({message:'Request not found'});
});
  
//Error Handler
app.use((err:errorTypeMiddleware, req:Request, res:Response, next:NextFunction)=> {
    
    if (err?.getHttpCode()){

        return res.status(err.getHttpCode()).json({message:`${err.message} ${err.getDetail()}`});
    }

    return res.status(500).json({message:`${err.message}`});

});  
