import express from 'express';
import { initBusTickets } from './model/ticketInfo.model.mjs';
import { ticketRouter } from './routes/ticket.route.mjs';
import { userRouter } from './routes/user.route.mjs';

const server = express();

// async function setupBus() {
//     await initBusTickets();
// }

async function serverInit() {
    await initBusTickets();

    server.use(
        '/api/v1',
        userRouter,
        ticketRouter
    );

    server.listen(7000);
    console.log('listening on port 7000');
}

export { serverInit };