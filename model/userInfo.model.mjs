import { mysqlConfig, mysqlClient } from '../config/database.config.mjs';
import { v4 as uuidV4 } from 'uuid';

async function getUserTable() {
    const mysqlSession = await mysqlClient.getSession();
    const schema = mysqlSession.getSchema(mysqlConfig.schema.name);
    const table = schema.getTable(mysqlConfig.schema.table.user_info)
    return [mysqlSession, table];
}

async function queryAllUsers() {
    const [mysqlSession, userTable] = await getUserTable();

    return userTable
        .select("user_id", "given_name", "family_name", "phone_number")
        .execute()
        .then(res => {
            let result = res.fetchAll();
            if (result) {
                result = result.map(row => {
                    return {
                        user_id: row[0],
                        given_name: row[1],
                        family_name: row[2],
                        phone_number: row[3]
                    };
                });
            } else {
                result = [];
            }

            return result;
        }).finally(() => {
            mysqlSession.close();
        });
}

async function queryUserByPhoneNumber(phoneNumber) {
    const [mysqlSession, userTable] = await getUserTable();

    return userTable
        .select("user_id", "given_name", "family_name", "phone_number")
        .where('phone_number = :phoneNumber')
        .bind('phoneNumber', phoneNumber)
        .execute()
        .then(res => {
            const result = res.fetchOne();
            if (result) {
                return {
                    user_id: result[0],
                    given_name: result[1],
                    family_name: result[2],
                    phone_number: result[3]
                };
            } else {
                return null;
            }
        }).finally(() => {
            mysqlSession.close();
        });
}

async function queryUserById(userId) {
    const [mysqlSession, userTable] = await getUserTable();

    return userTable
        .select("user_id", "given_name", "family_name", "phone_number")
        .where('user_id = :userId')
        .bind('userId', userId)
        .execute()
        .then(res => {
            const result = res.fetchOne();
            if (result) {
                return {
                    user_id: row[0],
                    given_name: row[1],
                    family_name: row[2],
                    phone_number: row[3]
                };
            } else {
                return null;
            }
        }).finally(() => {
            mysqlSession.close();
        });
}

/*
    userDTO = {
        given_name: string,
        family_name: string,
        phone_number: int
    }
*/
async function persistUserIfNotExists(userDTO) {
    const [mysqlSession, userTable] = await getUserTable();

    const user = await queryUserByPhoneNumber(userDTO.phone_number);

    if (user == null) {
        return await userTable
            .insert("user_id", "given_name", "family_name", "phone_number")
            .values(uuidV4(), userDTO.given_name, userDTO.family_name, userDTO.phone_number)
            .execute()
            .then(async () => await queryUserByPhoneNumber(userDTO.phone_number))
            .finally(() => {
                mysqlSession.close();
            });
    }

    return user;
}

export { queryAllUsers, queryUserByPhoneNumber, queryUserById, persistUserIfNotExists };