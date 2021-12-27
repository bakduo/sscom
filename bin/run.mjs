import {app} from '../index.mjs';
import * as http from http;

const http = http.Server(app);

const PORT = process.env.PORT || 3000;

// const server = app.listen(PORT,() => {
//     console.log(`Running on PORT ${PORT}`);
// });

const server = http.listen(PORT, () => {
    logger.info(`servidor socket escuchando en http://localhost:${PORT}`);
  });

server.on('listening', () => {
    console.log("Running listening");
});

server.on('error', (err) => {
    console.log("Error: ");
    console.log(err);
});
