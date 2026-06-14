const db = require('../config/database');
const { getDistance } = require('geolib');

exports.searchStudents = async (req, res) => {
  const { radiusKm, corso, esame, sameUniversita } = req.query;
  const userId = req.userId;
  const profileRes = await db.query(
    'SELECT lat, lng, universita_telematica FROM profiles WHERE user_id = $1',
    [userId]
  );
  const myProfile = profileRes.rows[0];
  if (!myProfile || !myProfile.lat || !myProfile.lng) {
    return res.status(400).json({ error: 'Posizione non impostata' });
  }
  
  let query = `
    SELECT p.user_id, p.nome, p.cognome, p.universita_telematica, p.corso_laurea, p.esami, p.lat, p.lng
    FROM profiles p
    WHERE p.user_id != $1
  `;
  const params = [userId];
  
  if (sameUniversita === 'true') {
    query += ` AND p.universita_telematica = $${params.length + 1}`;
    params.push(myProfile.universita_telematica);
  }
  
  if (corso) {
    query += ` AND p.corso_laurea = $${params.length + 1}`;
    params.push(corso);
  }
  if (esame) {
    query += ` AND $${params.length + 1} = ANY(p.esami)`;
    params.push(esame);
  }
  
  const candidatesRes = await db.query(query, params);
  const filtered = candidatesRes.rows.filter(cand => {
    if (!cand.lat || !cand.lng) return false;
    const distance = getDistance(
      { latitude: myProfile.lat, longitude: myProfile.lng },
      { latitude: cand.lat, longitude: cand.lng }
    ) / 1000;
    return distance <= radiusKm;
  });
  res.json(filtered);
};