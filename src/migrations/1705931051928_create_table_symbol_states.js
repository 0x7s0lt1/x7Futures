module.exports = {
    "up": `CREATE TABLE symbol_states 
(
    id int NOT NULL AUTO_INCREMENT ,
    api_id int NOT NULL ,
    symbol varchar(16) NOT NULL ,
    buy_state varchar(16) NOT NULL DEFAULT 'NEUTRAL',
    sell_state varchar(16) NOT NULL DEFAULT 'NEUTRAL',
    PRIMARY KEY (id),
    FOREIGN KEY (api_id) REFERENCES apis(id)
);`,
    "down": "DROP TABLE symbol_states;"
}