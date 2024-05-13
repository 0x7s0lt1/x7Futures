import mysql from "mysql2";
import migration from 'mysql-migrations';
import dotenv from "dotenv";

dotenv.config();

const connection = mysql.createPool(process.env.DATABASE_URL);

migration.init(connection, __dirname + '/migrations');

// ts-node ./src/migration.ts add migration create_table_foo_bar
