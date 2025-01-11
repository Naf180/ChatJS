const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let users = {};

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        console.log(`Received message: ${message}`);
        const data = JSON.parse(message);
        if (data.type === 'join') {
            users[data.username] = ws;
            wss.clients.forEach(client => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ type: 'join', username: data.username }));
                }
            });
        } else if (data.type === 'message') {
            wss.clients.forEach(client => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ type: 'message', from: data.from, message: data.message }));
                }
            });
        }
    });

    ws.on('close', () => {
        for (let username in users) {
            if (users[username] === ws) {
                delete users[username];
                wss.clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({ type: 'leave', username: username }));
                    }
                });
                break;
            }
        }
    });
});

server.listen(3000, () => {
    console.log('Server is listening on port 3000');
});
