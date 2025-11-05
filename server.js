const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server: IOServer } = require('socket.io');
const path = require('path');

const config = require('./config');
const authRoutes = require('./src/routes/authRoutes');
const productRoutes = require('./src/routes/productRoutes');
const chatRoutes = require('./src/routes/chatRoutes');
const { verifySocketToken } = require('./src/middleware/authenticateJWT'); // we'll export helper

const app = express();
const server = http.createServer(app);
const io = new IOServer(server, {
  cors: { origin: '*' }
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'src', 'public')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/chat', chatRoutes);

// MongoDB
mongoose.connect(config.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=> console.log('MongoDB conectado'))
  .catch(err => console.error('MongoDB error:', err.message));

// Socket.IO auth middleware
io.use(async (socket, next) => {
  try {
    await verifySocketToken(socket, next); // this will attach user to socket.user on success
  } catch (err) {
    next(err);
  }
});

io.on('connection', (socket) => {
  console.log('Usuario conectado');

  // Avisar a todos los clientes que alguien se conectó
  socket.broadcast.emit('userConnected', socket.user?.username || 'Un usuario');

  // Escuchar mensajes del cliente
  socket.on('chatMessage', (data) => {
    console.log('Mensaje recibido:', data);
    io.emit('chatMessage', data); // <--- esto reenvía el mensaje a TODOS los clientes
  });

  // Avisar cuando un usuario se desconecta
  socket.on('disconnect', () => {
    io.emit('userDisconnected', socket.user?.username || 'Un usuario');
  });

  socket.on('disconnect', () => {
    console.log('Usuario desconectado');
  });
});

// Attach io to app for routes that need it (no obligatorio)
app.set('io', io);

server.listen(config.port, () => {
  console.log(`Servidor iniciado en puerto ${config.port}`);
});

