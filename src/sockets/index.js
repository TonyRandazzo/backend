const ChatHandlers = require('./ChatHandlers');

function setupSockets(io) {
  io.on('connection', (socket) => {
    console.log('Nuovo client connesso:', socket.id);
    ChatHandlers(io, socket);
  });
}

module.exports = { setupSockets };