import React, { useEffect, useRef } from 'react';

function ChatBox({ messages, inputMsg, setInputMsg, onSend, disabled }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') onSend();
  };

  return (
    <div className="chat-box">
      <div className="messages">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`message ${msg.system ? 'system' : msg.from === 'me' ? 'mine' : 'theirs'}`}
          >
            {msg.system ? msg.text : (
              <>
                <span className="sender">{msg.from === 'me' ? 'You' : 'Stranger'}</span>
                <span className="text">{msg.text}</span>
              </>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="chat-input">
        <input
          type="text"
          placeholder={disabled ? 'Connect to chat...' : 'Type a message...'}
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
        <button onClick={onSend} disabled={disabled}>Send</button>
      </div>
    </div>
  );
}

export default ChatBox;