import React, { useState, useEffect } from 'react';
import './DisambiguationDropdown.css';

// Mock data - matching the AI chat system data
const MOCK_DATA = {
  employees: [
    { id: 1, name: 'Max Thompson', displayName: 'Max Thompson', type: 'employee' },
    { id: 2, name: 'Max Rodriguez', displayName: 'Max Rodriguez', type: 'employee' },
    { id: 3, name: 'Maxwell Chen', displayName: 'Maxwell Chen', type: 'employee' },
    { id: 4, name: 'Max Patel', displayName: 'Max Patel', type: 'employee' },
    { id: 5, name: 'Sarah Johnson', displayName: 'Sarah Johnson', type: 'employee' },
    { id: 6, name: 'Jennifer Davis', displayName: 'Jennifer Davis', type: 'employee' },
    { id: 7, name: 'Michael Roberts', displayName: 'Michael Roberts', type: 'employee' },
    { id: 8, name: 'David Kim', displayName: 'David Kim', type: 'employee' },
    { id: 9, name: 'Lisa Wong', displayName: 'Lisa Wong', type: 'employee' },
    { id: 10, name: 'Alex Turner', displayName: 'Alex Turner', type: 'employee' },
  ],
  departments: [
    { id: 1, name: 'Engineering', displayName: 'Engineering', type: 'department' },
    { id: 2, name: 'Marketing', displayName: 'Marketing', type: 'department' },
    { id: 3, name: 'Sales', displayName: 'Sales', type: 'department' },
    { id: 4, name: 'HR', displayName: 'HR', type: 'department' },
    { id: 5, name: 'Finance', displayName: 'Finance', type: 'department' },
  ],
  payruns: [
    { id: 6, name: 'Monthly Payroll', displayName: 'Monthly Payroll - June 2024', type: 'payrun' },
    { id: 7, name: 'Annual Bonus', displayName: 'Annual Bonus - Q1 2024', type: 'payrun' },
  ]
};

const DisambiguationDropdown = ({ detectedText, position, onObjectSelect, onClose }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    // Find suggestions based on detected text
    const findSuggestions = (text) => {
      const allObjects = [
        ...MOCK_DATA.employees,
        ...MOCK_DATA.departments,
        ...MOCK_DATA.payruns
      ];

      // Look for exact matches first, then partial matches
      const exactMatches = allObjects.filter(obj =>
        obj.name.toLowerCase() === text.toLowerCase()
      );

      const partialMatches = allObjects.filter(obj =>
        obj.name.toLowerCase().includes(text.toLowerCase()) &&
        !exactMatches.some(match => match.id === obj.id)
      );

      return [...exactMatches, ...partialMatches].slice(0, 5);
    };

    if (detectedText) {
      const foundSuggestions = findSuggestions(detectedText);
      setSuggestions(foundSuggestions);
      setSelectedIndex(foundSuggestions.length > 0 ? 0 : -1);
    } else {
      setSuggestions([]);
    }
  }, [detectedText]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (suggestions.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev =>
            prev < suggestions.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
            onObjectSelect(suggestions[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [suggestions, selectedIndex, onObjectSelect, onClose]);

  // Get appropriate icon for suggestion type
  const getSuggestionIcon = (type) => {
    switch (type) {
      case 'employee':
        return '👤';
      case 'department':
        return '🏢';
      case 'payrun':
        return '💰';
      default:
        return '📌';
    }
  };



  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div
      className="disambiguation-dropdown"
      style={{
        position: 'fixed',
        top: position.top || 100,
        left: position.left || 100,
        zIndex: 1000
      }}
    >
      <div className="disambiguation-header">
        <span className="header-icon">💡</span>
        <span className="header-text">Did you mean to reference this object?</span>
        <button className="close-button" onClick={onClose}>×</button>
      </div>

      <div className="disambiguation-suggestions">
        {suggestions.map((suggestion, index) => (
          <div
            key={suggestion.id}
            className={`disambiguation-item ${selectedIndex === index ? 'selected' : ''}`}
            onClick={() => onObjectSelect(suggestion)}
          >
            <span className="suggestion-icon">{getSuggestionIcon(suggestion.type)}</span>
            <div className="suggestion-content">
              <div className="suggestion-name">{suggestion.displayName}</div>
              <div className="suggestion-type">{suggestion.type}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="disambiguation-footer">
        <div className="disambiguation-shortcuts">
          <div className="shortcut">
            <span className="shortcut-key">↑↓</span>
            <span className="shortcut-desc">Navigate</span>
          </div>
          <div className="shortcut">
            <span className="shortcut-key">Enter</span>
            <span className="shortcut-desc">Select</span>
          </div>
          <div className="shortcut">
            <span className="shortcut-key">Esc</span>
            <span className="shortcut-desc">Close</span>
          </div>
        </div>
        <span className="footer-text">Click to insert as chip, or ignore</span>
      </div>
    </div>
  );
};

export default DisambiguationDropdown;
