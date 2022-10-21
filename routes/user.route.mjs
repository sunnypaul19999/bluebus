import { Router } from "express";
import bodyParser from "body-parser";
import { body, validationResult } from 'express-validator';

import { addUser } from "../service/user.service.mjs";


const userRouter = Router();
userRouter.use('/user', bodyParser.json());

async function userAdd(req, res) {
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
userRouter.post('/user/add',
    // body(['given_name', 'family_name', 'phone_number']).notEmpty,
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
    userAdd
);

export { userRouter };