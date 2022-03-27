
import passport from "passport";
import passportLocal from "passport-local";

import { errorGenericType } from "../interfaces";
import { appconfig, loggerApp, ERRORS_APP, userDAO, tokenDAO } from '../init/configure';
import { validateUser } from '../util/validuser';
import bcrypt from 'bcrypt';
import { isValidPassword } from "../util";
import jwt from 'jsonwebtoken';
import { EBase } from "../interfaces/custom";
import { checkRealToken } from "../util/validToken";
import { ETokenInvalid } from "./check-sign-token";
import { ITokenDTO } from '../dto/tokenDTO';

const LocalStrategy = passportLocal.Strategy;

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
    
       const user = await userDAO.findOne({keycustom:'email',valuecustom:idx});
    
       if (user){
        done(null, user);
       }
       done(new EInvalidUser("Invalid user",ERRORS_APP.EFindUser.code,ERRORS_APP.EInvalidUser.HttpStatusCode));
       
    });
    
    passport.use('signup',new LocalStrategy({ passReqToCallback:true,usernameField: "email"}, async (req,_email, _password, done) => {

        const { error } = validateUser(req.body);

        if (error){
            return done(new EInvalidUser(`Invalid user for creation ${error.details[0].message}`,ERRORS_APP.EInvalidUserForCreation.code,ERRORS_APP.EInvalidUserForCreation.HttpStatusCode));
        }

        try {

            const {email,username,password,roles} = req.body;

            const encontrado = await userDAO.findOne({keycustom:'email',valuecustom:email.toLowerCase()});

            const { error } = validateUser(encontrado);

            if (!error){
                return done(new EInvalidUser(`User existent Not permit`,ERRORS_APP.EInvalidUserRepited.code,ERRORS_APP.EInvalidUserRepited.HttpStatusCode));
            }

            const newPassword = bcrypt.hashSync(
                password,
                bcrypt.genSaltSync(11));

            const newUser = {
                email:email.toLowerCase(),
                username:username,
                password:newPassword,
                roles:roles,
                deleted:false
            }

            try {
                const savedUsers = await userDAO.saveOne(newUser);
                if (savedUsers){
                    const {email,roles} = savedUsers;
                    return done(null,{id:email,roles,token:'',refreshtoken:''});
                }
            } catch (error) {
                const err = error as errorGenericType;
                loggerApp.error(`Exception on LocalStrategy into passport: ${err.message}`);
                return done(new ESaveUser(`Exception on LocalStrategy into passport: ${err.message}`,ERRORS_APP.ESaveUser.code,ERRORS_APP.ESaveUser.HttpStatusCode));
            }

            
        } catch (error) {
            const err = error as errorGenericType;
            loggerApp.error(`Exception on LocalStrategy into passport: ${err.message}`);
            return done(new EFindUser(`Exception on LocalStrategy into passport: ${err.message}`,ERRORS_APP.EFindUser.code,ERRORS_APP.EFindUser.HttpStatusCode));
        }
        
    }));

    
    passport.use('login',new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
        try {

             let updateToken = false;
             let existeToken:ITokenDTO;

             const encontrado = await userDAO.findOne({keycustom:'email',valuecustom:email.toLowerCase()});

             if (!encontrado){
                return done(new EInvalidCredential('usuario o password invalido',ERRORS_APP.EInvalidCredential.code,ERRORS_APP.EInvalidCredential.HttpStatusCode));
             }

             const valido = await isValidPassword(password,encontrado.password);

             if (!valido){
                return done(new EInvalidCredential('usuario o password invalido',ERRORS_APP.EInvalidCredential.code,ERRORS_APP.EInvalidCredential.HttpStatusCode));
             }

             try {
                
                existeToken = await tokenDAO.findOne({keycustom:'email',valuecustom:email.toLowerCase()});
                
                if (existeToken){

                    if (existeToken.email===email.toLowerCase()){

                        try {

                            checkRealToken(existeToken.tmptoken);

                            return done(null,{id:encontrado.email,
                                username:encontrado.username,
                                roles:encontrado.roles,
                                token:existeToken.tmptoken,
                                refreshtoken:existeToken.token});

                        } catch (error) {
                            updateToken = true;
                            loggerApp.error(`Exception Token vencido se genera uno nuevo para el user: ${existeToken.email}`);
                        }
                    }
                }

             } catch (error) {
                const err = error as errorGenericType;
                loggerApp.error(`Exception on LocalStrategy into passport: ${err.message}`);
                return done(new EBase(`Exception on tokenDAO findOne into login: ${err.message}`,ERRORS_APP.EBase.code));
             }
             

            const token = jwt.sign(
                {
                    id:encontrado.email,
                    roles: encontrado.roles,
                },
                appconfig.jwt.secret,
                {
                    expiresIn: appconfig.jwt.timeToken,
                }
                );

            const refreshToken = jwt.sign({
                id:encontrado.email,
                roles: encontrado.roles,
            }, appconfig.jwt.secretRefresh);

            try {

                let tokenSaved:ITokenDTO;

                if (updateToken){
                    tokenSaved = await tokenDAO.updateOne(existeToken.token,{token:refreshToken,email:encontrado.email,tmptoken:token,date:Date.now()});
                }else{
                    tokenSaved = await tokenDAO.saveOne({token:refreshToken,email:encontrado.email,tmptoken:token,date:Date.now()});
                }

                if (tokenSaved){
                    return done(null,{id:encontrado.email,username:encontrado.username,roles:encontrado.roles,token:token,refreshtoken:tokenSaved.token});
                }

            } catch (error) {
                const err = error as errorGenericType;
                loggerApp.error(`Exception on LocalStrategy into passport: ${err.message}`);
                return done(new EBase(`Exception on MongoTokenDao into saveOne: ${err.message}`,ERRORS_APP.EBase.code));
            }

          } catch (error) {
            const err = error as errorGenericType;
            loggerApp.error(`Exception on LocalStrategy into passport: ${err.message}`);
            return done(new EBase(`Exception on LocalStrategy into MongoUserRemoteDao: ${err.message}`,ERRORS_APP.EBase.code));
          }    
    }));
        
}

