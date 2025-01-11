let ws;
let username;

function joinChat() {
    username = document.getElementById('username').value;
    if (username) {
        document.getElementById('chat-container').style.display = 'block';
        document.getElementById('username').disabled = true;
        document.querySelector('button').disabled = true;

        ws = new WebSocket('ws://localhost:3000');

        ws.onopen = () => {
            ws.send(JSON.stringify({ type: 'join', username: username }));
        };

        ws.onmessage = (event) => {
            console.log(`Received message: ${event.data}`);
            const data = JSON.parse(event.data);
            if (data.type === 'join') {
                document.getElementById('chat').innerHTML += `<div>${data.username} has joined the chat.</div>`;
            } else if (data.type === 'message') {
                document.getElementById('chat').innerHTML += `<div><strong>${data.from}:</strong> ${data.message}</div>`;
            } else if (data.type === 'leave') {
                document.getElementById('chat').innerHTML += `<div>${data.username} has left the chat.</div>`;
            }
        };

        ws.onclose = () => {
            document.getElementById('chat').innerHTML += `<div>You have left the chat.</div>`;
        };
    }
}

function sendMessage() {
    const message = document.getElementById('message').value;
    if (message) {
        ws.send(JSON.stringify({ type: 'message', from: username, message: message }));
        document.getElementById('message').value = '';
    }
}
