const socket = io();
let selfId = null;
let username = localStorage.getItem('username') || '';

// DOM元素
const messages = document.getElementById('messages');
const input = document.getElementById('input');
const sendBtn = document.getElementById('sendBtn');
const userCount = document.getElementById('userCount');
const usernameModal = document.getElementById('usernameModal');
const usernameInput = document.getElementById('usernameInput');
const joinBtn = document.getElementById('joinBtn');

// 显示用户名输入模态框
function showUsernameModal() {
  usernameModal.classList.remove('hidden');
  if (username) {
    usernameInput.value = username;
  }
  usernameInput.focus();
}

// 隐藏用户名输入模态框
function hideUsernameModal() {
  usernameModal.classList.add('hidden');
}

// 加入聊天
function joinChat() {
  const inputName = usernameInput.value.trim();
  if (inputName && inputName.length <= 5) {
    username = inputName;
    localStorage.setItem('username', username);
    socket.emit('join', username);
    hideUsernameModal();
  } else if (!inputName) {
    // 用户名为空
    usernameInput.classList.add('shake');
    setTimeout(() => usernameInput.classList.remove('shake'), 500);
  } else {
    // 用户名超过10个字符
    alert('用户名最多只能5个字符！');
    usernameInput.value = inputName.substring(0, 5); // 自动截取前10个字符
    usernameInput.focus();
  }
}

// 初始化事件监听
joinBtn.addEventListener('click', joinChat);
usernameInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    joinChat();
  }
});

// 显示用户名输入模态框
showUsernameModal();

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

// 发送消息
function sendMessage() {
  const text = input.value.trim();
  if (!text) return;
  socket.emit('chat message', { text });
  input.value = '';
}

// 点击发送按钮
sendBtn.onclick = sendMessage;

// 按Enter键发送消息
input.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    sendMessage();
  }
});

// 接收服务器事件
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

// 断线重连处理
socket.on('disconnect', () => {
  addMessage({ 
    text: '连接已断开，正在尝试重新连接...', 
    time: Date.now(),
    system: true 
  });
});

socket.on('connect', () => {
  if (selfId) {
    addMessage({ 
      text: '已重新连接到服务器', 
      time: Date.now(),
      system: true 
    });
    // 重新加入聊天室
    socket.emit('join', username);
  }
});
