import { mysqlConfig, mysqlClient } from '../config/database.config.mjs';
import { v4 as uuidV4 } from 'uuid';
import { InvalidSeatNumberException, TicketNotFoundException } from '../error/ticket.error.mjs';

async function queryBusInfoTable() {
    const mysqlSession = await mysqlClient.getSession();
    const schema = mysqlSession.getSchema(mysqlConfig.schema.name);
    const table = schema.getTable(mysqlConfig.schema.table.bus_info)
    return [mysqlSession, table];
}

async function queryTicketInfoTable() {
    const mysqlSession = await mysqlClient.getSession();
    const schema = mysqlSession.getSchema(mysqlConfig.schema.name);
    const table = schema.getTable(mysqlConfig.schema.table.ticket_info)
    return [mysqlSession, table];
}

async function queryBusById() {
    const [mysqlSession, busInfoTable] = await queryBusInfoTable();

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
    const bus = await queryBusById();
    const maxTickets = bus.max_tickets;

    const [mysqlSession, ticketInfoTable] = await queryTicketInfoTable();

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
async function queryAllTicketsByState(state) {
    const bus = await queryBusById(null);

    const [mysqlSession, ticketInfoTable] = await queryTicketInfoTable();

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
                        // user_id: row[2],
                        seat_number: row[3],
                        is_open: row[4]
                    };
                });
            } else {
                result = result.map(row => {
                    return {
                        ticket_id: row[0],
                        bus_id: row[1],
                        // user_id: row[2],
                        seat_number: row[3],
                        is_open: row[4]
                    };
                });
            }

            return result;
        }).finally(() => {
            mysqlSession.close();
        });
}

async function queryTicketById(ticketId) {
    const [mysqlSession, ticketInfoTable] = await queryTicketInfoTable();

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

async function queryTicketBySeatNumber(seatNumber) {
    const bus = await queryBusById(null);

    const [mysqlSession, ticketInfoTable] = await queryTicketInfoTable();

    return await ticketInfoTable
        .select('ticket_id', 'bus_id', 'user_id', 'seat_number', 'is_open')
        .where('bus_id = :busId and seat_number = :seatNumber')
        .bind('busId', bus.bus_id)
        .bind('seatNumber', seatNumber)
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

async function persistUserTicket(userId, seatNumber) {
    const bus = await queryBusById(null);

    const [mysqlSession, ticketInfoTable] = await queryTicketInfoTable();

    mysqlSession.sql('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');

    await mysqlSession.startTransaction();

    const ticket = await queryTicketBySeatNumber(seatNumber);

    try {
        if (ticket) {
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
                        return await queryTicketBySeatNumber(seatNumber);
                    });
            } else {
                return null;
            }
        } else {
            throw new InvalidSeatNumberException(`Invalid seat number: ${seatNumber}`);
        }
    } catch (err) {
        await mysqlSession.rollback();
        throw err;
    } finally {
        mysqlSession.close();
    }
}

async function reInitTicket(ticketId) {
    const bus = await queryBusById(null);

    const [mysqlSession, ticketInfoTable] = await queryTicketInfoTable();

    mysqlSession.sql('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');

    await mysqlSession.startTransaction();

    const ticket = await queryTicketById(ticketId);

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
    const bus = await queryBusById(null);

    const [mysqlSession, ticketInfoTable] = await queryTicketInfoTable();

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

export { persistUserTicket, queryTicketBySeatNumber, queryTicketById, queryAllTicketsByState, queryBusById, initBusTickets, reInitTicket, reInitAllTicket }