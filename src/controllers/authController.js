const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

exports.register = async (req, res) => {
  const { email, password, nome, cognome, universita_telematica, corso_laurea } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const userResult = await db.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id',
      [email, hashed]
    );
    const userId = userResult.rows[0].id;
    await db.query(
      `INSERT INTO profiles (user_id, nome, cognome, universita_telematica, corso_laurea, esami)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, nome, cognome, universita_telematica, corso_laurea, []]
    );
    const token = jwt.sign({ id: userId, email }, process.env.JWT_SECRET);
    res.status(201).json({ token, user: { id: userId, email, nome, cognome } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const userRes = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userRes.rows.length === 0) return res.status(401).json({ error: 'Credenziali errate' });
    const user = userRes.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Credenziali errate' });
    const token = jwt.sign({ id: user.id, email }, process.env.JWT_SECRET);
    res.json({ token, user: { id: user.id, email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};