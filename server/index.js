const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

app.use(express.json());

// 存储当前文档内容
let currentContent = '';

// Socket.IO连接处理
io.on('connection', (socket) => {
  console.log('用户已连接');

  // 发送当前内容给新连接的用户
  socket.emit('init-content', currentContent);

  // 处理内容更新
  socket.on('content-change', (newContent) => {
    currentContent = newContent;
    // 广播给其他所有用户
    socket.broadcast.emit('content-update', newContent);
  });

  socket.on('disconnect', () => {
    console.log('用户已断开连接');
  });
});

// API路由
app.get('/api/content', (req, res) => {
  res.json({ content: currentContent });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});