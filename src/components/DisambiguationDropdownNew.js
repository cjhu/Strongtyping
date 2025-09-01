import React, { useState } from 'react';
import './DisambiguationDropdownNew.css';

const DisambiguationDropdownNew = ({ disambiguationData, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  const { candidates, message } = disambiguationData;

  const handleSelect = (candidate, index) => {
    setSelectedOption(candidate);
    setIsOpen(false);
    onSelect(index, candidates);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="disambiguation-container">
      <p className="disambiguation-message">{message}</p>
      
      <div className="dropdown-container">
        <div 
          className={`dropdown-trigger ${isOpen ? 'open' : ''}`}
          onClick={toggleDropdown}
        >
          <span className="dropdown-placeholder">
            {selectedOption ? selectedOption.data.name : 'Select'}
          </span>
          <span className="dropdown-arrow">
            {isOpen ? '▲' : '▼'}
          </span>
        </div>

        {isOpen && (
          <div className="dropdown-menu">
            {candidates.map((candidate, index) => (
              <div
                key={candidate.data.id}
                className="dropdown-option"
                onClick={() => handleSelect(candidate, index)}
              >
                <div className="option-avatar">
                  {candidate.data.avatar || '👤'}
                </div>
                <div className="option-details">
                  <div className="option-name">{candidate.data.name}</div>
                  <div className="option-title">{candidate.data.role}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DisambiguationDropdownNew;
