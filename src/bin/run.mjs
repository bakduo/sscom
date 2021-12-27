import {app} from '../index.mjs';

import * as http from 'http';

const httpServer = http.Server(app);

const PORT = process.env.PORT || 3000;

const server = httpServer.listen(PORT, () => {
    console.info(`servidor socket escuchando en http://localhost:${PORT}`);
  });

server.on('listening', () => {
    console.log("Running listening");
});

server.on('error', (err) => {
    console.log("Error: ");
    console.log(err);
});
