// === CLIENTE DEL CHAT (para chat.html) ===

// Conecta con el servidor Socket.io
const socket = io({
  auth: { token: localStorage.getItem('token') }
});

// Recuperar usuario y token del almacenamiento local
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || 'null');

// Si no hay usuario logueado, redirigir al login
if (!user) {
  window.location.href = '/login.html';
}

// Referencias a elementos del DOM
const msgInput = document.getElementById('msgInput');
const chatForm = document.getElementById('chatForm');
const messagesDiv = document.getElementById('messages');

// Enviar mensaje al servidor
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const message = msgInput.value.trim();
  if (message) {
    socket.emit('chatMessage', {
     username: user.username,
      message,
      time: new Date().toISOString()
   });

    msgInput.value = '';
  }
});

// Recibir mensajes del servidor
socket.on('chatMessage', (data) => {
  const msgEl = document.createElement('div');
  msgEl.classList.add('message');

  // Diferenciar mensajes propios y ajenos
  if (data.username === user.username) {
    msgEl.classList.add('self');
  } else {
    msgEl.classList.add('other');
  }

  // 🕒 Formatear hora tipo "HH:MM"
  const date = new Date(data.time || Date.now());
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // 💬 Estructura del mensaje con hora
  msgEl.innerHTML = `
    <div class="msg-header">
      <strong>${data.username}</strong>
      <span class="time">${timeStr}</span>
    </div>
    <div class="msg-body">${data.message}</div>
  `;

  messagesDiv.appendChild(msgEl);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});



// Mostrar aviso cuando un usuario se conecta
socket.on('userConnected', (username) => {
  const info = document.createElement('div');
  info.classList.add('info');
  info.textContent = `🔵 ${username} se ha conectado`;
  messagesDiv.appendChild(info);
});

// Mostrar aviso cuando un usuario se desconecta
socket.on('userDisconnected', (username) => {
  const info = document.createElement('div');
  info.classList.add('info');
  info.textContent = `🔴 ${username} salió del chat`;
  messagesDiv.appendChild(info);
});

// --- NUEVO: botón para volver al portal de productos ---
document.getElementById('backToProducts').addEventListener('click', () => {
  window.location.href = '/';
});
