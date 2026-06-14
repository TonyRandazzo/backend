const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const searchRoutes = require('./routes/search');
const connectionsRoutes = require('./routes/connections');
const teamsRoutes = require('./routes/teams');
const messagesRoutes = require('./routes/messages');
const uploadRoutes = require('./routes/upload');
const { setupSockets } = require('./sockets');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use('/api/upload', uploadRoutes);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/connections', connectionsRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/messages', messagesRoutes);

setupSockets(io);

server.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});