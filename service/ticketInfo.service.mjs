import { TicketNotFoundException } from '../error/ticket.error.mjs';
import { UserNotFoundException } from '../error/user.error.mjs';
import { persistUserTicket, queryTicketBySeatNumber, queryTicketById, queryAllTicketsByState, queryBusById, initBusTickets, reInitTicket, reInitAllTicket } from '../model/ticketInfo.model.mjs';
import { queryUserById, queryUserByPhoneNumber } from '../model/userInfo.model.mjs';

async function getAllTicketsOpenTicket() {
    try {
        return await queryAllTicketsByState(true);
    } catch (err) {
        console.error(err, 'Failed to load ticket state from persistent storage');
        throw new Error('Failed to load ticket state from persistent storage');
    }
}

async function getAllTicketsClosedTicket(phoneNumber) {
    try {
        return await queryAllTicketsByState(false);
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
        throw err;
    }
}

async function openAllTicket() {
    try {
        return await reInitAllTicket();
    } catch (err) {
        console.error(err, 'Failed to load ticket state from persistent storage');
        throw err;
    }
}

async function getTicketById(ticketId) {
    try {
        const ticket = await queryTicketById(ticketId);
        if (ticket) {
            return ticket;
        } else {
            throw new TicketNotFoundException('ticket not found');
        }
    } catch (err) {
        console.error(err, 'Failed to get ticket by ticket id from persisten storage');
        throw err;
    }
}

async function getUserByTicketId(ticketId) {
    try {
        const ticket = await getTicketById(ticketId);
        const user = await queryUserById(ticket.user_id);
        return user;
    } catch (err) {
        console.error(err, 'Failed to get user by ticket id from persisten storage');
        throw err;
    }
}

export { getAllTicketsOpenTicket, getAllTicketsClosedTicket, closeTicket, openTicket, openAllTicket, getTicketById, getUserByTicketId };