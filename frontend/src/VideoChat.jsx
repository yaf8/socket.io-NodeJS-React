/* eslint-disable no-unused-vars */
import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3001'); // USE YOUR IP

function VideoChat() {
    const localVideoRef = useRef();
    const remoteVideoRef = useRef();
    const pc = useRef(new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] // Free Google STUN server
    }));

    useEffect(() => {
    // 1. Check if mediaDevices exists (prevents the crash in your screenshot)
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("MediaDevices not supported. Use HTTPS or the Chrome Flag fix.");
        return; 
    }

    const startMedia = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            if (localVideoRef.current) localVideoRef.current.srcObject = stream;
            
            stream.getTracks().forEach(track => {
                pc.current.addTrack(track, stream);
            });
        } catch (err) {
            console.error("Error accessing media devices:", err);
        }
    };

    startMedia();

    // Listeners
    socket.on('video-offer', async (offer) => {
        if (pc.current.signalingState === "stable") {
            await pc.current.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await pc.current.createAnswer();
            await pc.current.setLocalDescription(answer);
            socket.emit('video-answer', answer);
        }
    });

    socket.on('video-answer', async (answer) => {
        await pc.current.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on('new-ice-candidate', async (candidate) => {
        try {
            await pc.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
            console.error("Error adding ice candidate", e);
        }
    });

    return () => {
        socket.off('video-offer');
        socket.off('video-answer');
        socket.off('new-ice-candidate');
    };
}, []);

    const startCall = async () => {
        const offer = await pc.current.createOffer();
        await pc.current.setLocalDescription(offer);
        socket.emit('video-offer', offer);
    };

    return (
        <div style={{ textAlign: 'center' }}>
            <h2>Local Wi-Fi Video Chat</h2>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <video ref={localVideoRef} autoPlay playsInline muted style={{ width: '300px', border: '2px solid blue' }} />
                <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '300px', border: '2px solid green' }} />
            </div>
            <br />
            <button onClick={startCall} style={{ padding: '10px 20px', fontSize: '16px' }}>Start Call</button>
        </div>
    );
}

export default VideoChat;