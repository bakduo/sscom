import express from "express";

import * as users from './users.mjs';

import * as login from './login.mjs';

const routerGlobal = express.Router();

routerGlobal.use('/api/v1',login.routerLogin);

routerGlobal.use('/api/v1/users',users.routerUsers);

export {routerGlobal};