import React, { useState } from 'react';
import ChatInput from './ChatInput';
import ChatMessages from './ChatMessages';
import './ChatRail.css';

const ChatRail = () => {
  const [messages, setMessages] = useState([]);

  const handleSendMessage = (message, isUser = true) => {
    const newMessage = {
      id: Date.now(),
      content: message,
      timestamp: new Date(),
      isUser: isUser
    };
    setMessages(prev => [...prev, newMessage]);
  };

  return (
    <div className="chat-rail">
      <div className="chat-header">
        <h3>Chat with Rippling</h3>
      </div>

      <ChatMessages messages={messages} onSendMessage={handleSendMessage} />

      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatRail;
