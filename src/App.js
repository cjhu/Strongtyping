import React from 'react';
import ChatRail from './components/ChatRail';
import './App.css';

function App() {
  return (
    <div className="App">
      {/* Rippling Header */}
      <header className="rippling-header">
        <div className="header-left">
          <div className="rippling-logo">🟣 RIPPLING</div>
          <input 
            type="text" 
            className="search-bar" 
            placeholder="Search or jump to..."
          />
        </div>
        
        <div className="header-right">
          <div className="header-nav">
            <div className="nav-icon">🔔</div>
            <div className="nav-icon">⚙️</div>
            <div className="nav-icon">❓</div>
          </div>
          <div className="user-avatar">J</div>
        </div>
      </header>

      {/* Main App Content */}
      <div className="app-content">
        <div className="main-content">
          <div className="placeholder-content">
            <h1>Global Payroll</h1>
            <p>Welcome to your Rippling workspace. Use the chat assistant on the right to get help with payroll, employees, and more.</p>
          </div>
        </div>
        <ChatRail />
      </div>
    </div>
  );
}

export default App;
