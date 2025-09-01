import React, { useState } from 'react';
import ChatInput from './ChatInput';
import ChatMessages from './ChatMessages';
import './ChatRail.css';

const ChatRail = () => {
  const [messages, setMessages] = useState([]);

  const handleSendMessage = (message, isUser = true, canUndo = false, undoData = null) => {
    const newMessage = {
      id: Date.now(),
      content: message,
      timestamp: new Date(),
      isUser: isUser,
      canUndo: canUndo,
      undoData: undoData
    };
    setMessages(prev => {
      // If this is a new user message, hide undo options on previous messages
      if (isUser) {
        return [...prev.map(msg => ({ ...msg, canUndo: false })), newMessage];
      }
      return [...prev, newMessage];
    });
  };

  const handleUndo = (messageId) => {
    setMessages(prev => {
      const messageIndex = prev.findIndex(msg => msg.id === messageId);
      if (messageIndex === -1) return prev;
      
      const messageToUndo = prev[messageIndex];
      if (!messageToUndo.canUndo || !messageToUndo.undoData) return prev;
      
      // Remove the AI response and restore the disambiguation state
      const beforeMessage = prev.slice(0, messageIndex);
      
      // Add back the disambiguation message
      const disambiguationMessage = {
        id: Date.now(),
        content: messageToUndo.undoData.originalDisambiguationContent,
        timestamp: new Date(),
        isUser: false,
        canUndo: false
      };
      
      return [...beforeMessage, disambiguationMessage];
    });
  };

  return (
    <div className="chat-rail">
      <div className="chat-header">
        <div className="chat-header-icon">🤖</div>
        <div className="chat-header-content">
          <h3>Let's start working</h3>
          <p>Search, create, delete or make changes across all of Rippling</p>
        </div>
      </div>

      <ChatMessages messages={messages} onSendMessage={handleSendMessage} onUndo={handleUndo} />

      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatRail;
