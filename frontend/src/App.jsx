/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3001'); // Replace with your server URL

function App() {
    const [input, setInput] = useState('');

    useEffect(() => {
        // Clean up the socket connection when the component unmounts
        return () => {
            socket.disconnect();
        };
    }, []); // Run effect only once

    const sendMessage = () => {
      console.log('input', input)
        // Send a message to the server
        socket.emit('chat message', input);
        setInput('');
    };

    return (
        <div style={{display: 'flex', flexDirection: 'column', justifyContent: "center", width: "100%", height: "100%", gap: "10px"}}>
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
