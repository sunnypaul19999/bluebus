import { queryUserByPhoneNumber, queryUserById, persistUserIfNotExists } from '../model/userInfo.model.mjs';

async function getUserByPhoneNumber(phoneNumber) {
    try {
        return await queryUserByPhoneNumber(phoneNumber);
    } catch (err) {
        console.error(err, 'Failed to load user from persistent storage');
        throw new Error('Failed to load user from persistent storage');
    }
}

async function getUserById(userId) {
    try {
        return await queryUserById(userId);
    } catch (err) {
        console.error(err, 'Failed to load user from persistent storage');
        throw new Error('Failed to load user from persistent storage');
    }
}

async function addUser(user) {
    try {
        return await persistUserIfNotExists(user);
    } catch (err) {
        console.error(err, 'Failed to persist user');
        throw new Error('Failed to persist user');
    }
}


export { getUserByPhoneNumber, getUserById, addUser };