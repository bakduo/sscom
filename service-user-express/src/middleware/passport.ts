
import passport from "passport";
import passportLocal from "passport-local";

import { MongoUserRemoteDao } from '../dao/storage/user-remote';
import { errorGenericType } from "../interfaces";
import { appconfig, loggerApp, ERRORS_APP } from '../init/configure';
import { isValidUser } from "../util/validuser";
import bcrypt from 'bcrypt';
import { isValidPassword } from "../util";
import jwt from 'jsonwebtoken';
import { EBase } from "../interfaces/custom";
import { MongoTokenDao } from '../dao/storage/token';

const LocalStrategy = passportLocal.Strategy;

const genericUser = MongoUserRemoteDao.getInstance();

class EInvalidUser extends EBase {

    constructor(description:string,_code:number,_httpcode:number){
        super(description,_code,'',_httpcode);
    }   
}

class EInvalidCredential extends EBase {

    constructor(description:string,_code:number,_httpcode:number){
        super(description,_code,'',_httpcode);
    }   
}

class ESaveUser extends EBase {

    constructor(description:string,_code:number,_httpcode:number){
        super(description,_code,'',_httpcode);
    }   
}

class EFindUser extends EBase {

    constructor(description:string,_code:number,_httpcode:number){
        super(description,_code,'',_httpcode);
    }   
}

export const initPassport = ()=>{

    passport.serializeUser<any, any>((req, user, done) => {

        done(null,user);
    });
    
    passport.deserializeUser(async(id, done) => {
    
       const idx = id as string;
    
       const user = await genericUser.findOne({keycustom:'email',valuecustom:idx});
    
       if (user){
        done(null, user);
       }
       done(new EInvalidUser("Invalid user",ERRORS_APP.EFindUser.code,ERRORS_APP.EInvalidUser.HttpStatusCode));
       
    });
    
    passport.use('signup',new LocalStrategy({ passReqToCallback:true,usernameField: "email"}, (req,email, password, done) => {

           genericUser.findOne({keycustom:'email',valuecustom:email.toLowerCase()})

           .then((encontrado)=>{

                if (isValidUser(encontrado)){
                    return done(new EInvalidUser("Invalid user that exists",ERRORS_APP.EFindUser.code,ERRORS_APP.EInvalidUser.HttpStatusCode));
                }
                
                const {email,username,password,roles} = req.body;

                const newPassword = bcrypt.hashSync(
                    password,
                    bcrypt.genSaltSync(11));

                    const newUser = {
                        email:email,
                        username:username,
                        password:newPassword,
                        roles:roles,
                        deleted:false
                    }

                    genericUser.saveOne(newUser)

                    .then((user)=>{
                        
                        const {email,roles} = user;

                        return done(null,{id:email,roles,token:'',refreshtoken:''});

                    })
                    .catch((error)=>{
                        const err = error as errorGenericType;
                        loggerApp.error(`Exception on LocalStrategy into passport: ${err.message}`);
                        return done(new ESaveUser(`Exception on LocalStrategy into passport: ${err.message}`,ERRORS_APP.ESaveUser.code,ERRORS_APP.ESaveUser.HttpStatusCode));
                    });
                
           })
           .catch((error)=>{
            const err = error as errorGenericType;
            loggerApp.error(`Exception on LocalStrategy into passport: ${err.message}`);
            return done(new EFindUser(`Exception on LocalStrategy into passport: ${err.message}`,ERRORS_APP.EFindUser.code,ERRORS_APP.EFindUser.HttpStatusCode));
           })
        
    }));

    
    passport.use('login',new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
        try {
            const genericUser = MongoUserRemoteDao.getInstance();

              genericUser.findOne({keycustom:'email',valuecustom:email})

              .then((user)=>{
                if (!user) {
                    return done(new EInvalidCredential('usuario o password invalido',ERRORS_APP.EInvalidCredential.code,ERRORS_APP.EInvalidCredential.HttpStatusCode));
                  } else {
                    isValidPassword(password,user.password)
                    .then((valid)=>{

                        if (!valid) {
                            return done(new EInvalidCredential('usuario o password invalido',ERRORS_APP.EInvalidCredential.code,ERRORS_APP.EInvalidCredential.HttpStatusCode));
                          } else {

                            const token = jwt.sign(
                              {
                                id:user.email,
                                roles: user.roles,
                              },
                              appconfig.jwt.secret,
                              {
                                expiresIn: '1m',
                              }
                            );
                            const refreshToken = jwt.sign({
                                id:user.email,
                                roles: user.roles,
                              }, appconfig.jwt.secretRefresh);

                            const daorefresh = MongoTokenDao.getInstance();

                            daorefresh.saveOne({token:refreshToken,date:Date.now()})

                            .then((tokenRefresh)=>{

                                return done(null,{id:user.email,username:user.username,roles:user.roles,token:token,refreshtoken:tokenRefresh.token});

                            })
                            .catch((error)=>{
                                const err = error as errorGenericType;
                                loggerApp.error(`Exception on LocalStrategy into passport: ${err.message}`);
                                return done(new EBase(`Exception on MongoTokenDao into saveOne: ${err.message}`,ERRORS_APP.EBase.code));
                            })
                        }
                    })
                    .catch((error)=>{
                        const err = error as errorGenericType;
                        loggerApp.error(`Exception on LocalStrategy into passport: ${err.message}`);
                        return done(new EBase(`Exception on LocalStrategy into isValidPassword: ${err.message}`,ERRORS_APP.EBase.code));
                    })
                  }
              })
              .catch((error)=>{
                const err = error as errorGenericType;
                loggerApp.error(`Exception on LocalStrategy into passport: ${err.message}`);
                return done(new EBase(`Exception on LocalStrategy into findOne: ${err.message}`,ERRORS_APP.EBase.code));
              })
          } catch (error) {
            const err = error as errorGenericType;
            loggerApp.error(`Exception on LocalStrategy into passport: ${err.message}`);
            return done(new EBase(`Exception on LocalStrategy into MongoUserRemoteDao: ${err.message}`,ERRORS_APP.EBase.code));
          }    
    }));
        
}
