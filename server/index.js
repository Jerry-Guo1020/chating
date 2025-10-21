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

// 提供 client 目录下的静态文件————(没看懂)
app.use(express.static(join(__dirname, '../client')));
app.get('/', (req, res) => {
    res.sendFile(join(__dirname, '../client/index.html'));
});

// 使用io连接
io.on('connection', (socket) => {
    console.log("user connected successfully!");
    
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))




