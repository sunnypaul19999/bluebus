class UserNotFoundException extends Error {
    constructor(message) {
        super(message);
    }
}

export { UserNotFoundException };