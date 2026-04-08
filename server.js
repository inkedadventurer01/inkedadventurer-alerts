const express = require('express');
const { WebcastPushConnection } = require('tiktok-live-connector');
const { Server } = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static('public'));

const STREAMER_USERNAME = "inkedadventurer";

const connection = new WebcastPushConnection(STREAMER_USERNAME);

connection.connect().then(() => {
  console.log(`✅ Verbunden mit @${STREAMER_USERNAME}`);
}).catch(err => console.error('Fehler:', err));

connection.on('gift', data => {
  io.emit('alert', { 
    type: 'gift', 
    username: data.sender.uniqueId, 
    gift: data.gift.name || 'Gift', 
    diamonds: data.gift.diamondCount || 1 
  });
});

connection.on('follow', data => {
  io.emit('alert', { type: 'follow', username: data.uniqueId });
});

connection.on('chat', data => {
  if (data.comment && data.comment.includes('�')) {
    io.emit('alert', { type: 'sticker', username: data.uniqueId });
  }
});

connection.on('like', data => {
  if (data.likeCount > 8) {
    io.emit('alert', { type: 'like', count: data.likeCount });
  }
});

io.on('connection', () => console.log('Jemand ist auf der Alert-Seite'));

server.listen(3000, () => console.log('🚀 Server läuft'));
