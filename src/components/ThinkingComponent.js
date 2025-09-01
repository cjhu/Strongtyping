import React, { useState, useEffect } from 'react';
import './ThinkingComponent.css';

const ThinkingComponent = ({ content }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
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
  if (!Array.isArray(steps)) {
    console.error('Steps is not an array:', steps);
    return <div className="thinking-component"><div className="thinking-header">Invalid thinking data</div></div>;
  }

  // Simple step-by-step animation
  useEffect(() => {
    console.log('ThinkingComponent useEffect triggered, steps:', steps.length);
    
    if (steps.length === 0) {
      console.log('No steps, marking complete');
      setIsComplete(true);
      return;
    }

    // Reset state
    setCompletedSteps([]);
    setCurrentStep(-1);
    setIsComplete(false);

    let stepIndex = 0;
    const animateStep = () => {
      if (stepIndex < steps.length) {
        // Set current step
        setCurrentStep(stepIndex);
        
        // After a delay, complete this step and move to next
        setTimeout(() => {
          setCompletedSteps(prev => [...prev, stepIndex]);
          stepIndex++;
          
          if (stepIndex >= steps.length) {
            // All done
            setIsComplete(true);
            setCurrentStep(-1);
          } else {
            // Continue with next step
            setTimeout(animateStep, 100);
          }
        }, 800); // Fixed duration for simplicity
      }
    };

    // Start animation after a brief delay
    const startTimeout = setTimeout(animateStep, 200);
    
    return () => {
      clearTimeout(startTimeout);
    };
  }, [content]); // Only depend on content, not individual steps

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
      return '0.8 secs';
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
                  width: steps.length > 0 ? `${Math.min(100, (completedSteps.length / steps.length) * 100)}%` : '0%'
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
