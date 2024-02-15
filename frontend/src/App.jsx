/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3001'); // Replace with your server URL

function App() {
    const [input, setInput] = useState('');

    useEffect(() => {
        // Listen for messages from the server
        socket.on('chat message', (message) => {
            const receiveTime = Date.now(); // Current time when the client receives the message
            const millisecondsTaken = receiveTime - message.sendTime;
            console.log('Message from server:', message.message);
            console.log('Milliseconds taken:', millisecondsTaken);
        });

        // Clean up the socket connection when the component unmounts
        return () => {
            socket.disconnect();
        };
    }, []); // Run effect only once

    const sendMessage = () => {
        // Send a message to the server along with the timestamp
        const sendTime = Date.now();
        socket.emit('chat message', { message: input, sendTime });
        setInput('');
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: "center", width: "100%", height: "100%", gap: "10px" }}>
            <textarea
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
            />
            <button onClick={sendMessage}>Send</button>
        </div>
    );
}

export default App;
