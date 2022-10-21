import { fillTicket, getTicketBySeatNumber, getTicketById, getAllTicketsByState, initBusTickets, getBusById } from '../model/ticketInfo.model.mjs';

async function getAllTicketsOpenTicket() {
    try {
        return await getAllTicketsByState(true);
    } catch (err) {
        console.error(err, 'Failed to load ticket state from persistent storage');
        throw new Error('Failed to load ticket state from persistent storage');
    }
}

async function getAllTicketsClosedTicket(phoneNumber) {
    try {
        return await queryUserByPhoneNumber(false);
    } catch (err) {
        console.error(err, 'Failed to load ticket state from persistent storage');
        throw new Error('Failed to load ticket state from persistent storage');
    }
}

export { getAllTicketsOpenTicket, getAllTicketsClosedTicket };