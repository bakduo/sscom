import express from 'express';

import { routerGlobal } from './routes/index.mjs';

const app = express();

app.use(express.json({limit: '4mb'}));

app.use(express.urlencoded({ limit: '6mb',extended: true }));

app.use(routerGlobal);

export {app};