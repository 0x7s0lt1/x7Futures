module.exports = {
    "up": `CREATE TABLE apis
        ( 
            id int NOT NULL AUTO_INCREMENT,
            testnet boolean NOT NULL,
            name varchar(64) NOT NULL,
            exchange varchar(16) NOT NULL,
            public_key longtext NOT NULL,
            private_key longtext NOT NULL,
            extra longtext DEFAULT NULL,
            status varchar(16) NOT NULL DEFAULT 'ACTIVE',
            created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id) 
        );`,
    "down": "DROP TABLE apis;"
};