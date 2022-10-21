import { closeTicket, getAllTicketsClosedTicket, getAllTicketsOpenTicket, getUserByTicketId, openAllTicket, openTicket } from '../../service/ticketInfo.service.mjs';
import { validationResult } from 'express-validator';
import { ticketEventEmitter } from "../event/ticket.event.mjs";

async function openTicketEventHandler(req, res) {
    try {
        const ticket = await openTicket(req.query.ticketId);
        res.send(ticket);
    } catch (err) {
        if (err instanceof TicketNotFoundException) {
            res.status(404).send({
                message: 'ticket not found'
            });
            return;
        }
        res.sendStatus(500);
    }
}
ticketEventEmitter.on('openticket', openTicketEventHandler);

async function openAllTicketsEventHandler(req, res) {
    try {
        await openAllTicket();
        res.send({
            message: 'Opened all tickets'
        })
    } catch (err) {
        res.sendStatus(500);
    }
}
ticketEventEmitter.on('openalltickets', openAllTicketsEventHandler);

async function closeTicketEventHandler(req, res) {
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
ticketEventEmitter.on('closeticket', closeTicketEventHandler);

async function ticketHolderDetailsEventHandler(req, res) {
    try {
        const user = await getUserByTicketId(req.query.ticketId);
        if (user) {
            res.send({
                user: user,
                message: 'user found'
            });
        } else {
            res.send({
                user: null,
                message: 'user found'
            });
        }

    } catch (err) {
        if (err instanceof TicketNotFoundException) {
            res.status(404).send({
                message: 'ticket not found'
            });
            return;
        }
        res.sendStatus(500);
    }
}
ticketEventEmitter.on('ticketholderuserdetails', ticketHolderDetailsEventHandler);

async function allOpenTicketDetailsEventHandler(req, res) {
    try {
        const tickets = await getAllTicketsOpenTicket();
        res.send(tickets);
    } catch (err) {
        res.sendStatus(500);
    }
}
ticketEventEmitter.on('allopenticketdetails', allOpenTicketDetailsEventHandler);

async function allClosedTicketDetailsEventHandler(req, res) {
    try {
        const tickets = await getAllTicketsClosedTicket();
        res.send(tickets);
    } catch (err) {
        res.sendStatus(500);
    }
}
ticketEventEmitter.on('allclosedticketdetails', allClosedTicketDetailsEventHandler);