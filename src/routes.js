import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from './db.js';
import { verifyToken } from './middleware.js';

const router = express.Router();

const saltRounds = 10; // Количество раундов для соли

// Регистрация
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send('Username and password are required');
  }

  try {
    console.log('Registering user:', username);
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const result = await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *',
      [username, hashedPassword]
    );
    console.log('User registered:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === '23505') {
      // Код ошибки для уникального ограничения
      res.status(400).send('Username already exists');
    } else {
      res.status(500).send('Server error');
    }
  }
});

// Авторизация
// Login Route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).send('Username and password are required');
  }

  try {
    const user = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (user.rows.length === 0) return res.status(400).send('User not found');

    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) return res.status(400).send('Invalid password');

    const token = jwt.sign({ id: user.rows[0].id, username: user.rows[0].username }, 'your_jwt_secret', { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).send('Server error');
  }
});


// Пример защищенного маршрута
router.get('/protected', verifyToken, (req, res) => {
  res.send('This is a protected route');
});

// Тестовый маршрут для проверки соединения с БД
router.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).send('Database connection error');
  }
});

export default router;
