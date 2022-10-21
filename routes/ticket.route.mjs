import { Router } from "express";
import bodyParser from "body-parser";
import { body } from 'express-validator';
import { ticketEventEmitter } from "../events/event/ticket.event.mjs";
import '../events/eventhandler/ticketeventhandler.mjs';

const ticketRouter = Router();
ticketRouter.use('/ticket', bodyParser.json());

ticketRouter.get('/ticket/details/open/all', ticketEventEmitter.allOpenTicketDetailsEvent.bind(ticketEventEmitter));

ticketRouter.get('/ticket/details/close/all', ticketEventEmitter.allClosedTicketDetailsEvent.bind(ticketEventEmitter));

ticketRouter.put('/ticket/open', ticketEventEmitter.openTicketEvent.bind(ticketEventEmitter));

ticketRouter.put('/ticket/close',
    body(['phone_number'])
        .isLength({
            min: 10, max: 10
        })
        .isNumeric({
            locale: 'en-IN'
        }),
    body(['seat_number']).isNumeric(),
    ticketEventEmitter.closeTicketEvent.bind(ticketEventEmitter)
);

ticketRouter.put('/ticket/admin/open/all', ticketEventEmitter.openAllTicketsEvent.bind(ticketEventEmitter));

ticketRouter.get('/ticket/user', ticketEventEmitter.ticketHolderUserDetailsEvent.bind(ticketEventEmitter));

export { ticketRouter };