import React, { useState } from 'react';
import VideoChat from './components/VideoChat';
import './App.css';

function App() {
  const [started, setStarted] = useState(false);

  return (
    <div className="App">
      {!started ? (
        <div className="landing">
          <h1>🎥 RandomChat</h1>
          <p>Talk to strangers around the world via video chat</p>
          <button className="start-btn" onClick={() => setStarted(true)}>
            Start Chatting
          </button>
          <p className="disclaimer">
            By using this app, you agree to be respectful. 
            Users must be 18+.
          </p>
        </div>
      ) : (
        <VideoChat />
      )}
    </div>
  );
}

export default App;