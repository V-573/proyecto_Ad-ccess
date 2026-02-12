import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

export default pool; 

//aca estoy dando al driver pg  (postgreSQL para node.js)las credenciales para que pueda ingresar pero por aca no se ingresa, se da la informacion de donde se va a consultar. 