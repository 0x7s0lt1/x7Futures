module.exports = {
    "up": `CREATE TABLE symbol_settings
(
    id int NOT NULL AUTO_INCREMENT ,
    api_id int NOT NULL ,
    symbol varchar(16) NOT NULL ,
    status varchar(16) NOT NULL DEFAULT 'ACTIVE',
    leverage int NOT NULL DEFAULT 25,
    initial_capital decimal(16, 8) NOT NULL DEFAULT 1500,
    quote_amount decimal(16, 8) NOT NULL DEFAULT 100,
    PRIMARY KEY (id),
    FOREIGN KEY (api_id) REFERENCES apis(id)
);`,
    "down": "DROP TABLE symbol_settings;"
}