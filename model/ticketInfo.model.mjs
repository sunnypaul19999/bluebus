import { mysqlConfig, mysqlClient } from '../config/database.config.mjs';
import { v4 as uuidV4 } from 'uuid';
import { TicketNotFoundException } from '../error/ticket.error.mjs';

async function getBusInfoTable() {
    const mysqlSession = await mysqlClient.getSession();
    const schema = mysqlSession.getSchema(mysqlConfig.schema.name);
    const table = schema.getTable(mysqlConfig.schema.table.bus_info)
    return [mysqlSession, table];
}

async function getTicketInfoTable() {
    const mysqlSession = await mysqlClient.getSession();
    const schema = mysqlSession.getSchema(mysqlConfig.schema.name);
    const table = schema.getTable(mysqlConfig.schema.table.ticket_info)
    return [mysqlSession, table];
}

async function getBusById() {
    const [mysqlSession, busInfoTable] = await getBusInfoTable();

    return await busInfoTable
        .select('bus_id', 'bus_tickets')
        .execute()
        .then(res => {
            let result = res.fetchOne();

            return {
                bus_id: result[0],
                max_tickets: result[1]
            };
        }).finally(() => {
            mysqlSession.close();
        });
}

async function initBusTickets() {
    const bus = await getBusById();
    const maxTickets = bus.max_tickets;

    const [mysqlSession, ticketInfoTable] = await getTicketInfoTable();

    await mysqlSession.startTransaction();

    const currTicketCount = await ticketInfoTable
        .select('ticket_id')
        .where('bus_id = :busId')
        .bind('busId', bus.bus_id)
        .execute()
        .then(res => res.fetchAll().length);

    console.log(currTicketCount);

    try {
        for (let i = currTicketCount; i < maxTickets; i++) {
            await ticketInfoTable
                .insert('ticket_id', 'bus_id', 'user_id', 'seat_number', 'is_open')
                .values(uuidV4(), bus.bus_id, null, i + 1, true)
                .execute()
                .then(async () => {
                    await mysqlSession.commit();
                })
        }
    } catch (err) {
        await mysqlSession.rollback();
        throw err;
    } finally {
        mysqlSession.close();
    }
}
/**
 * 
 * @param state boolean
 */
async function getAllTicketsByState(state) {
    const bus = await getBusById(null);

    const [mysqlSession, ticketInfoTable] = await getTicketInfoTable();

    return await ticketInfoTable
        .select('ticket_id', 'bus_id', 'user_id', 'seat_number', 'is_open')
        .where('is_open = :state and bus_id = :busId')
        .bind('busId', bus.bus_id)
        .bind('state', state)
        .orderBy('seat_number asc')
        .execute()
        .then(res => {
            let result = res.fetchAll();
            if (state) {
                result = result.map(row => {
                    return {
                        ticket_id: row[0],
                        bus_id: row[1],
                        is_open: row[3]
                    };
                });
            } else {
                result = result.map(row => {
                    return {
                        ticket_id: row[0],
                        bus_id: row[1],
                        user_id: row[2],
                        is_open: row[3]
                    };
                });
            }

            return result;
        }).finally(() => {
            mysqlSession.close();
        });
}

async function getTicketById(ticketId) {
    const [mysqlSession, ticketInfoTable] = await getTicketInfoTable();

    return await ticketInfoTable
        .select('ticket_id', 'bus_id', 'user_id', 'seat_number', 'is_open')
        .where('ticket_id = :ticketId')
        .bind('ticketId', ticketId)
        .execute()
        .then(res => {
            const result = res.fetchOne();
            if (result) {
                return {
                    ticket_id: result[0],
                    bus_id: result[1],
                    user_id: result[2],
                    seat_number: result[3],
                    is_open: result[4]
                }
            } else {
                return null;
            }

        }).finally(() => {
            mysqlSession.close();
        });
}

async function getTicketBySeatNumber(seatNumber) {
    const bus = await getBusById(null);

    const [mysqlSession, ticketInfoTable] = await getTicketInfoTable();

    return await ticketInfoTable
        .select('ticket_id', 'bus_id', 'user_id', 'seat_number', 'is_open')
        .where('bus_id = :busId and seat_number = :seatNumber')
        .bind('busId', bus.bus_id)
        .bind('seatNumber', seatNumber)
        .execute()
        .then(res => {
            const result = res.fetchOne();
            return {
                ticket_id: result[0],
                bus_id: result[1],
                user_id: result[2],
                seat_number: result[3],
                is_open: result[4]
            }
        }).finally(() => {
            mysqlSession.close();
        });
}

async function persistUserTicket(userId, seatNumber) {
    const bus = await getBusById(null);

    const [mysqlSession, ticketInfoTable] = await getTicketInfoTable();

    mysqlSession.sql('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');

    await mysqlSession.startTransaction();

    const ticket = await getTicketBySeatNumber(seatNumber);

    try {
        if (ticket.is_open) {
            return await ticketInfoTable
                .update()
                .where('ticket_id = :ticketId and bus_id = :busId')
                .bind('ticketId', ticket.ticket_id)
                .bind('busId', bus.bus_id)
                .set('user_id', userId)
                .set('is_open', false)
                .execute()
                .then(async () => {
                    await mysqlSession.commit();
                    return await getTicketBySeatNumber(seatNumber);
                });
        } else {
            return null;
        }
    } catch (err) {
        await mysqlSession.rollback();
        throw err;
    } finally {
        mysqlSession.close();
    }
}

async function reInitTicket(ticketId) {
    const bus = await getBusById(null);

    const [mysqlSession, ticketInfoTable] = await getTicketInfoTable();

    mysqlSession.sql('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');

    await mysqlSession.startTransaction();

    const ticket = await getTicketById(ticketId);

    try {
        if (ticket) {
            return await ticketInfoTable
                .update()
                .where('ticket_id = :ticketId and bus_id = :busId')
                .bind('ticketId', ticket.ticket_id)
                .bind('busId', bus.bus_id)
                .set('user_id', null)
                .set('is_open', true)
                .execute()
                .then(async () => {
                    await mysqlSession.commit();
                });
        } else {
            throw new TicketNotFoundException('cannot close ticket. ticket not found');
        }
    } catch (err) {
        await mysqlSession.rollback();
        throw err;
    } finally {
        mysqlSession.close();
    }
}

async function reInitAllTicket() {
    const bus = await getBusById(null);

    const [mysqlSession, ticketInfoTable] = await getTicketInfoTable();

    mysqlSession.sql('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');

    await mysqlSession.startTransaction();

    try {
        await ticketInfoTable
            .update()
            .where('bus_id = :busId')
            .bind('busId', bus.bus_id)
            .set('user_id', null)
            .set('is_open', true)
            .execute()
            .then(async () => {
                await mysqlSession.commit();
            });
    } catch (err) {
        await mysqlSession.rollback();
        throw err;
    } finally {
        mysqlSession.close();
    }
}

export { persistUserTicket, getTicketBySeatNumber, getTicketById, getAllTicketsByState, initBusTickets, getBusById, reInitTicket, reInitAllTicket }