const db = require('../config/database');

exports.getProfile = async (req, res) => {
  const result = await db.query(
    `SELECT p.nome, p.cognome, p.universita_telematica, p.corso_laurea, p.esami, p.lat, p.lng, p.avatar_url, p.comune, p.provincia
     FROM profiles p WHERE p.user_id = $1`,
    [req.userId]
  );
  res.json(result.rows[0] || {});
};

exports.updateProfile = async (req, res) => {
  const { nome, cognome, universita_telematica, corso_laurea, esami } = req.body;
  await db.query(
    `UPDATE profiles SET nome=$1, cognome=$2, universita_telematica=$3, corso_laurea=$4, esami=$5
     WHERE user_id=$6`,
    [nome, cognome, universita_telematica, corso_laurea, esami, req.userId]
  );
  res.json({ success: true });
};

exports.updateLocation = async (req, res) => {
  const { lat, lng, comune, provincia } = req.body;
  await db.query(
    'UPDATE profiles SET lat=$1, lng=$2, comune=$3, provincia=$4, last_location_update=NOW() WHERE user_id=$5',
    [lat, lng, comune, provincia, req.userId]
  );
  res.json({ success: true });
};

exports.updateAvatar = async (req, res) => {
  res.json({ success: true, avatarUrl: null });
};

exports.deleteAccount = async (req, res) => {
  const userId = req.userId;
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM team_members WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM connections WHERE user_id = $1 OR connected_user_id = $1', [userId]);
    await client.query('DELETE FROM direct_messages WHERE from_user_id = $1 OR to_user_id = $1', [userId]);
    await client.query('DELETE FROM team_messages WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM profiles WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM users WHERE id = $1', [userId]);
    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};