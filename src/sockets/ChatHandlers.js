const db = require('../config/database');

module.exports = (io, socket) => {
  socket.on('join-private', ({ userId, otherId }) => {
    const room = [userId, otherId].sort().join('-');
    socket.join(room);
    socket.privateRoom = room;
  });

  socket.on('private-message', async ({ from, to, message, fileUrl, fileName }) => {
    await db.query(
      `INSERT INTO direct_messages (from_user_id, to_user_id, message, file_url, file_name, is_read)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [from, to, message, fileUrl, fileName, false]
    );
    const userRes = await db.query('SELECT nome, cognome FROM profiles WHERE user_id = $1', [from]);
    const fromName = userRes.rows[0] ? `${userRes.rows[0].nome} ${userRes.rows[0].cognome}` : 'Utente';
    const room = [from, to].sort().join('-');
    io.to(room).emit('private-message', {
      from, to, message, fileUrl, fileName, createdAt: new Date(), fromName
    });
  });

  socket.on('join-team', ({ teamId }) => {
    socket.join(`team_${teamId}`);
  });

  socket.on('team-message', async ({ teamId, userId, message, fileUrl, fileName }) => {
    const memberCheck = await db.query('SELECT 1 FROM team_members WHERE team_id = $1 AND user_id = $2', [teamId, userId]);
    if (memberCheck.rows.length === 0) return;
    await db.query(
      `INSERT INTO team_messages (team_id, user_id, message, file_url, file_name)
     VALUES ($1, $2, $3, $4, $5)`,
      [teamId, userId, message, fileUrl, fileName]
    );
    io.to(`team_${teamId}`).emit('team-message', {
      teamId, userId, message, fileUrl, fileName, createdAt: new Date()
    });
  });

  socket.on('disconnect', () => { });
};