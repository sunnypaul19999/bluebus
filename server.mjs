import express from 'express';
import { userRouter } from './routes/user.route.mjs';

const server = express();

function serverInit() {
    server.use(
        '/api/v1',
        userRouter
    );
    server.listen(7000);
    console.log('listening on port 7000');
}

export { serverInit };