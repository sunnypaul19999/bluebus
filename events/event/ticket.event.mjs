import { EventEmitter } from 'events';

class TicketEventEmitter extends EventEmitter {

    openTicketEvent(req, res, next) {
        this.emit('openticket', req, res, next);
    }

    openAllTicketsEvent(req, res, next) {
        this.emit('openalltickets', req, res, next);
    }

    closeTicketEvent(req, res, next) {
        this.emit('closeticket', req, res, next);
    }

    ticketHolderUserDetailsEvent(req, res, next) {
        this.emit('ticketholderuserdetails', req, res, next);
    }

    allOpenTicketDetailsEvent(req, res, next) {
        this.emit('allopenticketdetails', req, res, next);
    }

    allClosedTicketDetailsEvent(req, res, next) {
        this.emit('allclosedticketdetails', req, res, next);
    }
}
const ticketEventEmitter = new TicketEventEmitter();

export { ticketEventEmitter };