import { validationResult } from 'express-validator';
import { userEventEmitter } from "../event/user.event.mjs";
import { addUser } from '../../service/user.service.mjs';

async function createUserEventHandler(req, res) {
    const userDTOBindingResult = validationResult(req);
    if (userDTOBindingResult.isEmpty()) {
        const userDTO = req.body;
        try {
            const user = await addUser(userDTO);
            res.send(user);
        } catch (err) {
            res.sendStatus(500);
        }
    } else {
        res.sendStatus(400);
    }
}
userEventEmitter.on('createuser', createUserEventHandler);