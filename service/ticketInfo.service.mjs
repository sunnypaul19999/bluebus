import { UserNotFoundException } from '../error/user.error.mjs';
import { persistUserTicket, getTicketBySeatNumber, getTicketById, getAllTicketsByState, initBusTickets, getBusById, reInitTicket } from '../model/ticketInfo.model.mjs';
import { queryUserByPhoneNumber } from '../model/userInfo.model.mjs';

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
        return await getAllTicketsByState(false);
    } catch (err) {
        console.error(err, 'Failed to load ticket state from persistent storage');
        throw new Error('Failed to load ticket state from persistent storage');
    }
}

async function closeTicket(phoneNumber, seatNumber) {
    const user = await queryUserByPhoneNumber(phoneNumber);
    if (!user) {
        throw new UserNotFoundException(`User with phone number not found ${phoneNumber}`);
    }

    try {
        return await persistUserTicket(user.user_id, seatNumber);
    } catch (err) {
        console.error(err, 'Failed to load ticket state from persistent storage');
        throw new Error('Failed to load ticket state from persistent storage');
    }
}

async function openTicket(ticketId) {
    try {
        return await reInitTicket(ticketId);
    } catch (err) {
        console.error(err, 'Failed to load ticket state from persistent storage');
        throw new Error('Failed to load ticket state from persistent storage');
    }
}

export { getAllTicketsOpenTicket, getAllTicketsClosedTicket, closeTicket, openTicket };