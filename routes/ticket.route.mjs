import { Router } from "express";
import bodyParser from "body-parser";
import { body, validationResult } from 'express-validator';
import { closeTicket, getAllTicketsClosedTicket, getAllTicketsOpenTicket, openTicket } from "../service/ticketInfo.service.mjs";
import { getBusById } from "../model/ticketInfo.model.mjs";
import { UserNotFoundException } from "../error/user.error.mjs";

const ticketRouter = Router();
ticketRouter.use('/ticket', bodyParser.json());

async function getOpenTickects(req, res) {
    try {
        const tickets = await getAllTicketsOpenTicket();
        res.send(tickets);
    } catch (err) {
        res.sendStatus(500);
    }
}
ticketRouter.get('/ticket/all/open',
    getOpenTickects
);

async function getClosedTickets(req, res) {
    try {
        const tickets = await getAllTicketsClosedTicket();
        res.send(tickets);
    } catch (err) {
        res.sendStatus(500);
    }
}
ticketRouter.get('/ticket/all/close',
    getClosedTickets
);

ticketRouter.get('/bus',
    async (req, res) => {
        const bus = await getBusById();
        console.log(bus);
        res.send(bus);
    }
);

async function bookTicket(req, res) {
    try {
        const dataValidation = validationResult(req);
        if (dataValidation.isEmpty()) {
            const reqBody = req.body;
            const ticket = await closeTicket(reqBody.phone_number, reqBody.seat_number);
            if (ticket) {
                res.send(ticket);
            } else {
                res.status(409).send({
                    message: 'ticket unavailable'
                })
            }
        } else {
            res.sendStatus(400);
        }
    } catch (err) {
        if (err instanceof UserNotFoundException) {
            res.status(404).send({
                message: 'Please register before booking ticket'
            });
            return;
        }
        res.sendStatus(500);
    }
}
ticketRouter.put('/ticket/close',
    body(['phone_number'])
        .isLength({
            min: 10, max: 10
        })
        .isNumeric({
            locale: 'en-IN'
        }),
    body(['seat_number']).isNumeric(),
    bookTicket
);


async function unBookTicket(req, res) {
    try {
        const ticket = await openTicket(req.query.ticketId);
        // console.log(ticket);
        // res.send(req.query.ticketId)
        res.send(ticket);
    } catch (err) {
        res.sendStatus(500);
    }
}
ticketRouter.get('/ticket/open',
    unBookTicket
);

export { ticketRouter };