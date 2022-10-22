class TicketNotFoundException extends Error {
    constructor(message) {
        super(message);
    }
}

class InvalidSeatNumberException extends Error {
    constructor(message) {
        super(message);
    }
}

export { TicketNotFoundException, InvalidSeatNumberException };