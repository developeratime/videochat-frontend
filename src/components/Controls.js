import React from 'react';

function Controls({ status, onStart, onSkip, onStop }) {
  return (
    <div className="controls">
      {status === 'idle' && (
        <button className="btn start" onClick={onStart}>▶ Start</button>
      )}
      {status === 'waiting' && (
        <button className="btn stop" onClick={onStop}>⏹ Stop</button>
      )}
      {status === 'connected' && (
        <>
          <button className="btn skip" onClick={onSkip}>⏭ Next</button>
          <button className="btn stop" onClick={onStop}>⏹ Stop</button>
        </>
      )}
    </div>
  );
}

export default Controls;