const chatHandlers = require('./chatHandlers');

function setupSockets(io) {
  io.on('connection', (socket) => {
    console.log('Nuovo client connesso:', socket.id);
    chatHandlers(io, socket);
  });
}

module.exports = { setupSockets };