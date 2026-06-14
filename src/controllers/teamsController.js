const db = require('../config/database');

exports.createTeam = async (req, res) => {
  const { exam_title, description } = req.body;
  if (!exam_title || !description) {
    return res.status(400).json({ error: 'Titolo e descrizione obbligatori' });
  }
  const result = await db.query(
    'INSERT INTO teams (name, exam_title, description, created_by) VALUES ($1, $2, $3, $4) RETURNING id',
    [exam_title, exam_title, description, req.userId]
  );
  const teamId = result.rows[0].id;
  await db.query(
    'INSERT INTO team_members (team_id, user_id) VALUES ($1, $2)',
    [teamId, req.userId]
  );
  res.json({ id: teamId, exam_title, description });
};

exports.joinTeam = async (req, res) => {
  const { teamId } = req.params;
  const userId = req.userId;
  const countRes = await db.query('SELECT COUNT(*) FROM team_members WHERE team_id = $1', [teamId]);
  if (parseInt(countRes.rows[0].count) >= 4) {
    return res.status(400).json({ error: 'Team al completo (4 membri)' });
  }
  const alreadyMember = await db.query('SELECT 1 FROM team_members WHERE team_id = $1 AND user_id = $2', [teamId, userId]);
  if (alreadyMember.rows.length > 0) {
    return res.status(400).json({ error: 'Già membro del team' });
  }
  await db.query('INSERT INTO team_members (team_id, user_id) VALUES ($1, $2)', [teamId, userId]);
  res.json({ success: true });
};

exports.getUserTeams = async (req, res) => {
  const result = await db.query(
    `SELECT t.id, t.name, t.exam_title, t.description, array_agg(u.id) as members
     FROM teams t
     JOIN team_members tm ON tm.team_id = t.id
     JOIN users u ON u.id = tm.user_id
     WHERE tm.user_id = $1
     GROUP BY t.id`,
    [req.userId]
  );
  res.json(result.rows);
};

exports.getAllTeams = async (req, res) => {
  const userId = req.userId;
  const result = await db.query(
    `SELECT t.id, t.name, t.exam_title, t.description, t.created_by,
            (SELECT COUNT(*) FROM team_members WHERE team_id = t.id) as member_count,
            EXISTS(SELECT 1 FROM team_members WHERE team_id = t.id AND user_id = $1) as is_member
     FROM teams t
     ORDER BY t.created_at DESC`,
    [userId]
  );
  res.json(result.rows);
};

exports.getTeamMessages = async (req, res) => {
  const { teamId } = req.params;
  const userId = req.userId;
  const memberCheck = await db.query('SELECT 1 FROM team_members WHERE team_id = $1 AND user_id = $2', [teamId, userId]);
  if (memberCheck.rows.length === 0) {
    return res.status(403).json({ error: 'Non sei membro di questo team' });
  }
  const result = await db.query(
    `SELECT tm.id, tm.user_id, tm.message, tm.file_url, tm.file_name, tm.created_at, p.nome, p.cognome
     FROM team_messages tm
     JOIN profiles p ON p.user_id = tm.user_id
     WHERE tm.team_id = $1
     ORDER BY tm.created_at ASC`,
    [teamId]
  );
  res.json(result.rows);
};