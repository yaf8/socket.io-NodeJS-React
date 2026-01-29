/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import VideoChat from './VideoChat.jsx';

function App() {
    const [input, setInput] = useState('');
    
    // 1. Use a Ref to store the socket instance
    const socketRef = useRef(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        // 2. Initialize the socket INSIDE the useEffect
        // This ensures a new connection is made for every mount cycle
        socketRef.current = io('http://192.168.1.5:3001');

        // Listen for messages
        socketRef.current.on('chat message', (message) => {
            const receiveTime = Date.now();
            const millisecondsTaken = receiveTime - message.sendTime;
            console.clear();
            console.log('Message from server:', message.message);
            console.log('Delay:', millisecondsTaken);
        });

        socketRef.current.on('canvas hover change', (message) => {
            const receiveTime = Date.now();
            const millisecondsTaken = receiveTime - message.sendTime;
            console.clear();
            console.log(message.message);
            console.log("Delay : ", millisecondsTaken);
        });

        // 3. Clean up the SPECIFIC socket instance created in this effect
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    const handleInputChange = (e) => {
        const newInput = e.target.value;
        setInput(newInput);
        const sendTime = Date.now();
        // 4. Access the socket via the Ref
        if(socketRef.current) {
            socketRef.current.emit('chat message', { message: newInput, sendTime });
        }
    };

    const handleMouseMove = (e) => {
        if (!canvasRef.current) return; // Safety check
        const rect = canvasRef.current.getBoundingClientRect();
        const x = parseInt(e.clientX - rect.left);
        const y = parseInt(e.clientY - rect.top);
        const sendTime = Date.now();
        
        // 4. Access the socket via the Ref
        if(socketRef.current) {
            socketRef.current.emit('canvas hover change', { message: { x, y }, sendTime });
        }
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
            <VideoChat />
        </div>
    );
}

export default App;