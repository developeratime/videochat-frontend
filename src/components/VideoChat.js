import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import SimplePeer from 'simple-peer';
import ChatBox from './ChatBox';
import Controls from './Controls';

const SOCKET_SERVER = 'http://localhost:3001';

function VideoChat() {
  const [status, setStatus] = useState('idle');
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const socketRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(SOCKET_SERVER);
    socketRef.current.on('waiting', () => { setStatus('waiting'); setMessages([]); });
    socketRef.current.on('partner_found', async ({ initiator }) => {
      setStatus('connected');
      setMessages([{ text: 'Connected! Say hello 👋', system: true }]);
      await startPeerConnection(initiator);
    });
    socketRef.current.on('offer', ({ offer }) => { if (peerRef.current) peerRef.current.signal(offer); });
    socketRef.current.on('answer', ({ answer }) => { if (peerRef.current) peerRef.current.signal(answer); });
    socketRef.current.on('ice_candidate', ({ candidate }) => { if (peerRef.current) peerRef.current.signal(candidate); });
    socketRef.current.on('chat_message', ({ message }) => { setMessages(prev => [...prev, { text: message, from: 'stranger' }]); });
    socketRef.current.on('partner_disconnected', () => {
      setStatus('idle'); setMessages([]);
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
      if (peerRef.current) { peerRef.current.destroy(); peerRef.current = null; }
    });
    return () => { socketRef.current.disconnect(); };
  }, []);

  const getLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      return stream;
    } catch (err) { alert('Camera/Microphone access is required!'); }
  };

  const startPeerConnection = async (initiator) => {
    const stream = localStreamRef.current || await getLocalStream();
    const peer = new SimplePeer({ initiator, trickle: false, stream });
    peer.on('signal', (data) => {
      if (data.type === 'offer') socketRef.current.emit('offer', { offer: data });
      else if (data.type === 'answer') socketRef.current.emit('answer', { answer: data });
      else socketRef.current.emit('ice_candidate', { candidate: data });
    });
    peer.on('stream', (remoteStream) => { if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream; });
    peer.on('close', () => { setStatus('idle'); if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null; });
    peerRef.current = peer;
  };

  const handleStart = async () => { await getLocalStream(); setStatus('waiting'); socketRef.current.emit('find_partner'); };
  const handleSkip = () => {
    socketRef.current.emit('skip');
    if (peerRef.current) { peerRef.current.destroy(); peerRef.current = null; }
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    setStatus('waiting'); socketRef.current.emit('find_partner');
  };
  const handleStop = () => {
    socketRef.current.emit('skip');
    if (peerRef.current) { peerRef.current.destroy(); peerRef.current = null; }
    if (localStreamRef.current) { localStreamRef.current.getTracks().forEach(t => t.stop()); localStreamRef.current = null; }
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    setStatus('idle'); setMessages([]);
  };
  const sendMessage = () => {
    if (!inputMsg.trim()) return;
    socketRef.current.emit('chat_message', { message: inputMsg });
    setMessages(prev => [...prev, { text: inputMsg, from: 'me' }]);
    setInputMsg('');
  };

  return (
    <div className="video-chat-container">
      <div className="video-section">
        <div className="video-wrapper remote">
          <video ref={remoteVideoRef} autoPlay playsInline className="remote-video" />
          {status !== 'connected' && (
            <div className="video-placeholder">
              {status === 'waiting' ? '🔍 Finding someone...' : '👤 No one connected'}
            </div>
          )}
        </div>
        <div className="video-wrapper local">
          <video ref={localVideoRef} autoPlay playsInline muted className="local-video" />
        </div>
      </div>
      <Controls status={status} onStart={handleStart} onSkip={handleSkip} onStop={handleStop} />
      <ChatBox messages={messages} inputMsg={inputMsg} setInputMsg={setInputMsg} onSend={sendMessage} disabled={status !== 'connected'} />
    </div>
  );
}

export default VideoChat;