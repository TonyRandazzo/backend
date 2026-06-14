const db = require('../config/database');

exports.getConversation = async (req, res) => {
  const { otherUserId } = req.params;
  const userId = req.userId;
  const result = await db.query(
    `SELECT * FROM direct_messages
     WHERE (from_user_id = $1 AND to_user_id = $2) OR (from_user_id = $2 AND to_user_id = $1)
     ORDER BY created_at ASC`,
    [userId, otherUserId]
  );
  res.json(result.rows);
};

exports.markAsRead = async (req, res) => {
  const { otherUserId } = req.params;
  await db.query(
    'UPDATE direct_messages SET is_read = true WHERE from_user_id = $1 AND to_user_id = $2 AND is_read = false',
    [otherUserId, req.userId]
  );
  res.json({ success: true });
};

exports.getUnreadCounts = async (req, res) => {
  const result = await db.query(
    'SELECT from_user_id, COUNT(*) FROM direct_messages WHERE to_user_id = $1 AND is_read = false GROUP BY from_user_id',
    [req.userId]
  );
  const counts = {};
  result.rows.forEach(row => { counts[row.from_user_id] = parseInt(row.count); });
  res.json(counts);
};