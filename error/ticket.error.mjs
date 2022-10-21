class TicketNotFoundException extends Error {
    constructor(message) {
        super(message);
    }
}

export { TicketNotFoundException };