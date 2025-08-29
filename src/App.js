import React from 'react';
import ChatRail from './components/ChatRail';
import './App.css';

function App() {
  return (
    <div className="App">
      <div className="main-content">
        {/* This would be your main page content */}
        <div className="placeholder-content">
          <h1>Rippling Dashboard</h1>
          <p>Main content area - the chat rail is on the right</p>
        </div>
      </div>
      <ChatRail />
    </div>
  );
}

export default App;
