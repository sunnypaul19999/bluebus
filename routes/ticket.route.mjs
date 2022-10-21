import { Router } from "express";
import bodyParser from "body-parser";
import { body, validationResult } from 'express-validator';
import { getAllTicketsOpenTicket } from "../service/ticketInfo.service.mjs";
import { getBusById } from "../model/ticketInfo.model.mjs";

const ticketRouter = Router();
ticketRouter.use('/ticket', bodyParser.json());

async function allOpenTickets(req, res) {
    try {
        const tickets = await getAllTicketsOpenTicket();
        res.send(tickets);
    } catch (err) {
        res.sendStatus(500);
    }
}
ticketRouter.get('/ticket/all/open',
    allOpenTickets
);


ticketRouter.get('/bus',
    async (req, res) => {
        const bus = await getBusById();
        console.log(bus);
        res.send(bus);
    }
);

export { ticketRouter };