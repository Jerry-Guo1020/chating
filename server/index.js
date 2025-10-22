const express = require('express')
const { log } = require('node:console')
const app = express()
const port = 3000

const { join } = require('node:path')

//创建http 服务器
const http = require('http')
const server = http.createServer(app);

const { Server } = require('socket.io')

const io = new Server(server);

// 提供 client 目录下的静态文件
app.use(express.static(join(__dirname, '../client')));
app.get('/', (req, res) => {
    res.sendFile(join(__dirname, '../client/index.html'));
});

// 存储用户信息
const users = new Map();

// 使用io连接
io.on('connection', (socket) => {
    console.log("用户已连接，ID:", socket.id);
    
    // 用户加入聊天室
    socket.on('join', (username) => {
        // 保存用户信息
        users.set(socket.id, {
            id: socket.id,
            username: username
        });
        
        // 通知用户已成功加入
        socket.emit('joined', { id: socket.id });
        
        // 发送系统消息通知所有人
        io.emit('system message', {
            text: `${username} 加入了聊天室`,
            time: Date.now()
        });
        
        // 更新在线用户列表
        io.emit('userlist', Array.from(users.values()));
    });
    
    // 处理聊天消息
    socket.on('chat message', (msg) => {
        const user = users.get(socket.id);
        if (!user) return;
        
        // 广播消息给所有用户
        io.emit('chat message', {
            text: msg.text,
            username: user.username,
            selfId: socket.id,
            time: Date.now()
        });
    });
    
    // 用户断开连接
    socket.on('disconnect', () => {
        const user = users.get(socket.id);
        if (!user) return;
        
        // 从用户列表中移除
        users.delete(socket.id);
        
        // 发送系统消息
        io.emit('system message', {
            text: `${user.username} 离开了聊天室`,
            time: Date.now()
        });
        
        // 更新在线用户列表
        io.emit('userlist', Array.from(users.values()));
        
        console.log('用户断开连接:', user.username);
    });
});

// 使用http服务器监听端口，而不是express应用
server.listen(port, () => console.log(`聊天服务器运行在端口 ${port}!`));




