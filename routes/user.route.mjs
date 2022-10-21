import { Router } from "express";
import bodyParser from "body-parser";
import { body } from 'express-validator';
import { userEventEmitter } from "../events/event/user.event.mjs";
import '../events/eventhandler/usereventhandler.mjs';

const userRouter = Router();
userRouter.use('/user', bodyParser.json());

userRouter.post('/user/add',
    body(['given_name', 'family_name'])
        .isLength({
            min: 3, max: 50
        })
        .toUpperCase(),

    body(['phone_number'])
        .isLength({
            min: 10, max: 10
        })
        .isNumeric({
            locale: 'en-IN'
        }),

    userEventEmitter.createUserEvent.bind(userEventEmitter)
);

export { userRouter };