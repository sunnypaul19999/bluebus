import { getClient } from '@mysql/xdevapi';
import dotenv from 'dotenv';
dotenv.config();

const mysqlConfig = {
    connection: {
        user: process.env['DATABASE_USERNAME'],
        password: process.env['DATABASE_PASSWORD'],
        host: process.env['DATABASE_HOST'],
        port: parseInt(process.env['DATABASE_PORT']),
    },
    schema: {
        name: 'bluebus',
        table: {
            user_info: 'user_info',
            bus_info: 'bus_info',
            ticket_info: 'ticket_info'
        }
    }
}

//freezing databaseConfig object from further modifications
Object.freeze(mysqlConfig);

const mysqlClient = getClient(mysqlConfig.connection, {
    pooling: {
        enabled: true,
        maxSize: 200
    }
});

export { mysqlConfig, mysqlClient };