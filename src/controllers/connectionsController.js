const db = require('../config/database');

exports.sendRequest = async (req, res) => {
  const { targetUserId } = req.body;
  await db.query(
    'INSERT INTO connections (user_id, connected_user_id, status) VALUES ($1, $2, $3)',
    [req.userId, targetUserId, 'pending']
  );
  res.json({ success: true });
};

exports.acceptRequest = async (req, res) => {
  const { connectionId } = req.body;
  await db.query(
    'UPDATE connections SET status = $1 WHERE id = $2 AND connected_user_id = $3',
    ['accepted', connectionId, req.userId]
  );
  res.json({ success: true });
};

exports.getPendingRequests = async (req, res) => {
  const result = await db.query(
    `SELECT c.id, u.id as user_id, p.nome, p.cognome
     FROM connections c
     JOIN users u ON c.user_id = u.id
     JOIN profiles p ON p.user_id = u.id
     WHERE c.connected_user_id = $1 AND c.status = 'pending'`,
    [req.userId]
  );
  res.json(result.rows);
};

exports.getAcceptedConnections = async (req, res) => {
  const result = await db.query(
    `SELECT u.id as user_id, p.nome, p.cognome
     FROM connections c
     JOIN users u ON (c.user_id = u.id OR c.connected_user_id = u.id)
     JOIN profiles p ON p.user_id = u.id
     WHERE (c.user_id = $1 OR c.connected_user_id = $1) AND c.status = 'accepted' AND u.id != $1`,
    [req.userId]
  );
  res.json(result.rows);
};