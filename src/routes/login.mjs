import express from "express";

import { config } from "../config/index.mjs";

import UserDAO from "../dao/user.mjs";

import CredentialDAO from "../dao/credential.mjs";

import LoginController from "../controller/login.mjs";

import { validateSignupPayload } from "../middleware/validate-signup.mjs";

const routerLogin = express.Router();

const controller = new LoginController(new UserDAO(config.databaseUser),new CredentialDAO(config.databaseCredential));

routerLogin.post('/signup',validateSignupPayload,controller.signup);

routerLogin.post('/login',controller.login);

export {routerLogin};