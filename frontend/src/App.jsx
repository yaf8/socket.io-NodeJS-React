/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3001'); // Replace with your server URL

function App() {
    const [input, setInput] = useState('');
    const canvasRef = useRef(null);

    useEffect(() => {
        // Listen for messages from the server
        socket.on('chat message', (message) => {
            const receiveTime = Date.now(); // Current time when the client receives the message
            const millisecondsTaken = receiveTime - message.sendTime;
            console.clear();
            console.log('Message from server:', message.message);
            console.log('Delay:', millisecondsTaken);
        });

        socket.on('canvas hover change', (message) => {

            const receiveTime = Date.now(); // Current time when the client receives the message
            const millisecondsTaken = receiveTime - message.sendTime;
            console.clear();
            console.log(message.message);

            console.log("Delay : ", millisecondsTaken)
        })

        // Clean up the socket connection when the component unmounts
        return () => {
            socket.disconnect();
        };
    }, []); // Run effect only once

    const handleInputChange = (e) => {
        const newInput = e.target.value;
        setInput(newInput);
        const sendTime = Date.now();
        socket.emit('chat message', { message: newInput, sendTime });
    };

    const handleMouseMove = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = parseInt(e.clientX - rect.left);
        const y = parseInt(e.clientY - rect.top);
        const sendTime = Date.now();
        socket.emit('canvas hover change', { message: { x, y }, sendTime });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: "center", width: "100%", height: "100%", gap: "10px" }}>
            <textarea
                type="text"
                value={input}
                onChange={handleInputChange}
            />
            <canvas
                ref={canvasRef}
                width="300"
                height="300"
                style={{ border: '1px solid black' }}
                onMouseMove={handleMouseMove}
            />
        </div>
    );
}

export default App;
