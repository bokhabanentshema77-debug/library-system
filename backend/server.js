require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend is working!');
});

// LOGIN - Membership ID + Name
app.post('/api/login', async (req, res) => {
  const { membership_id, name } = req.body;
  try {
    const [rows] = await db.query(
      'SELECT * FROM users WHERE membership_id = ? AND name = ?',
      [membership_id, name]
    );
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Membership ID or name does not exist.' });
    }
    const user = rows[0];
    delete user.password;
    res.json({ message: 'Login success', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// REGISTER
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    await db.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, password]);
    res.json({ message: 'User created!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ALL BOOKS
app.get('/api/books', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM books');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADD A BOOK
app.post('/api/books', async (req, res) => {
  const { title, author, isbn, copies } = req.body;
  try {
    await db.query('INSERT INTO books (title, author, isbn, copies, available) VALUES (?, ?, ?, ?, ?)', [title, author, isbn, copies, copies]);
    res.json({ message: 'Book added!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// BORROW A BOOK
app.post('/api/borrow', async (req, res) => {
  const { user_id, book_id } = req.body;
  try {
    await db.query('INSERT INTO borrowings (user_id, book_id, borrow_date, status) VALUES (?, ?, CURDATE(), "borrowed")', [user_id, book_id]);
    await db.query('UPDATE books SET available = available - 1 WHERE id = ?', [book_id]);
    res.json({ message: 'Book borrowed!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});