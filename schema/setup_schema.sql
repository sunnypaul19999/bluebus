drop database if exists bluebus;

create database if not exists bluebus;

use bluebus;

CREATE TABLE IF NOT EXISTS user_info (
    user_id VARCHAR(250),
    phone_number CHAR(10) UNIQUE NOT NULL,
    given_name VARCHAR(250) NOT NULL,
    family_name VARCHAR(250) NOT NULL,
    CONSTRAINT user_info_pk_user_id PRIMARY KEY (user_id)
);


CREATE TABLE IF NOT EXISTS bus_info (
    bus_id VARCHAR(250),
    bus_tickets INTEGER,
    CONSTRAINT bus_info_pk_bus_id PRIMARY KEY (bus_id)
);

drop table if exists ticket_info;
CREATE TABLE IF NOT EXISTS ticket_info (
    ticket_id varchar(250),
    seat_number INTEGER,
    is_open BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP (),
    bus_id VARCHAR(250),
    user_id VARCHAR(250),
    CONSTRAINT ticket_info_pk_ticket_id PRIMARY KEY (ticket_id),
    CONSTRAINT ticket_info_fk_bus_id FOREIGN KEY (bus_id)
        REFERENCES bus_info (bus_id),
    CONSTRAINT ticket_info_fk_user_id FOREIGN KEY (user_id)
        REFERENCES user_info (user_id)
);

insert into bus_info (bus_id, bus_tickets) values('bluebus1', 40); 