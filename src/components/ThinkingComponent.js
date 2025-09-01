import React, { useState, useEffect } from 'react';
import './ThinkingComponent.css';

const ThinkingComponent = ({ content }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Parse the thinking data
  let thinkingData;
  try {
    thinkingData = JSON.parse(content);
  } catch (e) {
    console.error('Error parsing thinking data:', e);
    return <div className="thinking-component"><div className="thinking-header">Error loading thinking steps</div></div>;
  }

  const { steps = [], query = '' } = thinkingData;

  // Validate steps data
  if (!Array.isArray(steps) || steps.length === 0) {
    return <div className="thinking-component"><div className="thinking-header">Thinking complete</div></div>;
  }

  // Ultra-simple progress animation
  useEffect(() => {
    console.log('Starting thinking animation for', steps.length, 'steps');
    
    setProgress(0);
    setIsComplete(false);

    // Simple interval-based progress
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 1;
      setProgress(currentProgress);
      
      if (currentProgress >= steps.length) {
        setIsComplete(true);
        clearInterval(interval);
        console.log('Thinking animation complete');
      }
    }, 800);

    return () => {
      clearInterval(interval);
    };
  }, [content, steps.length]);

  const getStepIcon = (stepType, stepIndex) => {
    if (stepIndex < progress) {
      return '✅';
    } else if (stepIndex === progress) {
      return '⚡';
    } else {
      // Icon based on step type
      switch (stepType) {
        case 'parsing': return '🔍';
        case 'lookup': return '📊';
        case 'retrieval': return '📄';
        case 'calculation': return '🧮';
        case 'verification': return '✔️';
        case 'analysis': return '🧠';
        case 'preparation': return '📝';
        default: return '⚪';
      }
    }
  };

  const getStepTime = (stepIndex) => {
    if (stepIndex < progress) {
      return '0.8 secs';
    } else if (stepIndex === progress) {
      return '...';
    } else {
      return '';
    }
  };

  return (
    <div className="thinking-component">
      <div 
        className="thinking-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="thinking-icon">🧠</div>
        <div className="thinking-title">
          {isComplete ? 'Thinking complete' : 'Thinking...'}
        </div>
        <div className="expand-icon">
          {isExpanded ? '▼' : '▶'}
        </div>
      </div>

      {isExpanded && (
        <div className="thinking-steps">
          {steps.map((step, index) => (
            <div 
              key={step.id || index} 
              className={`thinking-step ${
                index < progress ? 'completed' : 
                index === progress ? 'active' : 'pending'
              }`}
            >
              <div className="step-icon">
                {getStepIcon(step.type, index)}
              </div>
              <div className="step-content">
                <div className="step-text">{step.text}</div>
                <div className="step-time">{getStepTime(index)}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isExpanded && (
        <div className="thinking-summary">
          <div className="summary-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ 
                  width: steps.length > 0 ? `${Math.min(100, (progress / steps.length) * 100)}%` : '0%'
                }}
              />
            </div>
            <span className="progress-text">
              {Math.min(progress, steps.length)} of {steps.length} steps
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThinkingComponent;
