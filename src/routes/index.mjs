import express from "express";

import * as users from './users.mjs';

const routerGlobal = express.Router();

routerGlobal.use('/api/v1/users',users.routerUsers);

export {routerGlobal};