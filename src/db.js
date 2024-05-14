import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: 'myuser',
  host: 'localhost',
  database: 'myappdb',
  password: 'mypasswo',
  port: 5432,
});

pool.on('connect', () => {
  console.log('Connected to the database');
});

pool.on('error', (err) => {
  console.error('Database connection error', err.stack);
});

export default pool;
