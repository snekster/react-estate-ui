import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: 'myuser',
  host: '45.95.202.35',
  database: 'myappdb',
  password: 'T2#||s!@<dAl',
  port: 5432,
});

pool.on('connect', () => {
  console.log('Connected to the database');
});

pool.on('error', (err) => {
  console.error('Database connection error', err.stack);
});

export default pool;
