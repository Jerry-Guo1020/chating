const socket = io();
let selfId = null;
let username = localStorage.getItem('username') || '';

function askName() {
  const name = prompt('请输入昵称：', username || '');
  username = name?.trim() || '匿名用户';
  localStorage.setItem('username', username);
  socket.emit('join', username);
}
askName();

const messages = document.getElementById('messages');
const input = document.getElementById('input');
const sendBtn = document.getElementById('sendBtn');
const userCount = document.getElementById('userCount');

function addMessage({ text, username, time, self = false, system = false }) {
  if (system) {
    const sys = document.createElement('div');
    sys.className = 'system-msg';
    sys.textContent = `${new Date(time).toLocaleTimeString()} — ${text}`;
    messages.appendChild(sys);
  } else {
    const msg = document.createElement('div');
    msg.className = 'message' + (self ? ' self' : '');
    msg.innerHTML = `
      <div class="avatar"></div>
      <div>
        <div class="bubble">${text}</div>
        <div class="meta">${username} • ${new Date(time).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</div>
      </div>
    `;
    messages.appendChild(msg);
  }
  messages.scrollTop = messages.scrollHeight;
}

sendBtn.onclick = () => {
  const text = input.value.trim();
  if (!text) return;
  socket.emit('chat message', { text });
  input.value = '';
};

socket.on('joined', (data) => {
  selfId = data.id;
});

socket.on('chat message', (msg) => {
  addMessage({
    ...msg,
    self: msg.selfId === selfId,
    system: false
  });
});

socket.on('system message', (msg) => {
  addMessage({ ...msg, system: true });
});

socket.on('userlist', (list) => {
  userCount.textContent = `在线 ${list.length} 人`;
});
