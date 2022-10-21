import { EventEmitter } from 'events';

class UserEventEmitter extends EventEmitter {

    createUserEvent(req, res, next) {
        this.emit('createuser', req, res, next);
    }
}

const userEventEmitter = new UserEventEmitter();

export { userEventEmitter };