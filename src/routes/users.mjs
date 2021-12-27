import express from "express";

import UserController from "../controller/user.mjs";

import { config } from "../config/index.mjs";

import UserDAO from "../dao/user.mjs";

import { validateUserPayload } from "../middleware/validate-user.mjs";

const routerUsers = express.Router();

const controller = new UserController(new UserDAO(config.databaseUser));

routerUsers.get('/list',controller.getAll);

routerUsers.get('/:id',controller.getOne);

routerUsers.delete('/:id',controller.deleteOne);

routerUsers.post('/',validateUserPayload,controller.save);

routerUsers.put('/:id',validateUserPayload,controller.updateOne);

export {routerUsers};