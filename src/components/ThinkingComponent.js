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
    if (steps.length === 0) return;

    let timeoutId;
    let currentStepIndex = 0;
    
    const animateNextStep = () => {
      if (currentStepIndex < steps.length) {
        const step = steps[currentStepIndex];
        
        // Mark current step as active
        setCurrentStep(currentStepIndex);
        
        // After step duration, mark as completed and move to next
        timeoutId = setTimeout(() => {
          setCompletedSteps(prev => [...prev, currentStepIndex]);
          currentStepIndex++;
          
          if (currentStepIndex < steps.length) {
            animateNextStep();
          } else {
            // All steps completed
            setIsComplete(true);
            setCurrentStep(-1); // No active step
          }
        }, step.duration || 500);
      }
    };

    // Start animation
    animateNextStep();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [steps]);

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
      return `${(steps[stepIndex].duration / 1000).toFixed(1)} secs`;
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
                  width: `${((completedSteps.length + (currentStep >= 0 ? 0.5 : 0)) / steps.length) * 100}%` 
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
