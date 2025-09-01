import React, { useState, useEffect } from 'react';
import './ThinkingComponent.css';

const ThinkingComponent = ({ content }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Parse the thinking data
  let thinkingData;
  try {
    thinkingData = JSON.parse(content);
  } catch (e) {
    return <div>Error parsing thinking data</div>;
  }

  const { steps = [], query = '' } = thinkingData;

  // Animate steps over time
  useEffect(() => {
    if (!steps || steps.length === 0) return;

    // Reset state when new content comes in
    setCompletedSteps([]);
    setCurrentStep(0);
    setIsComplete(false);

    const timeouts = [];
    let totalTime = 0;
    
    steps.forEach((step, index) => {
      const stepDuration = typeof step.duration === 'number' ? step.duration : 500;
      
      // Set current step
      const currentTimeout = setTimeout(() => {
        setCurrentStep(index);
      }, totalTime);
      timeouts.push(currentTimeout);
      
      // Complete step
      const completeTimeout = setTimeout(() => {
        setCompletedSteps(prev => {
          if (!prev.includes(index)) {
            return [...prev, index];
          }
          return prev;
        });
        
        // If this is the last step, mark as complete
        if (index === steps.length - 1) {
          setIsComplete(true);
          setCurrentStep(-1);
        }
      }, totalTime + stepDuration);
      timeouts.push(completeTimeout);
      
      totalTime += stepDuration;
    });

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [steps, content]); // Added content as dependency to reset on new data

  const getStepIcon = (stepType, stepIndex) => {
    if (completedSteps.includes(stepIndex)) {
      return '✅';
    } else if (currentStep === stepIndex) {
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
    if (completedSteps.includes(stepIndex)) {
      const step = steps[stepIndex];
      const duration = typeof step?.duration === 'number' ? step.duration : 500;
      return `${(duration / 1000).toFixed(1)} secs`;
    } else if (currentStep === stepIndex) {
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
              key={step.id} 
              className={`thinking-step ${
                completedSteps.includes(index) ? 'completed' : 
                currentStep === index ? 'active' : 'pending'
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
                  width: steps.length > 0 ? `${((completedSteps.length + (currentStep >= 0 ? 0.5 : 0)) / steps.length) * 100}%` : '0%'
                }}
              />
            </div>
            <span className="progress-text">
              {completedSteps.length} of {steps.length} steps
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThinkingComponent;
