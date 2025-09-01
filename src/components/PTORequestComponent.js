import React, { useState } from 'react';
import './PTORequestComponent.css';

const PTORequestComponent = ({ ptoData, onSubmitRequest }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Auto-submit when both dates are entered (only once)
  React.useEffect(() => {
    if (startDate && endDate && !hasSubmitted) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      
      // Mark as submitted to prevent multiple submissions
      setHasSubmitted(true);
      
      // Small delay to let user see the calculation
      setTimeout(() => {
        onSubmitRequest({
          startDate,
          endDate,
          days: daysDiff,
          reason: 'Personal time off'
        });
      }, 1000);
    }
  }, [startDate, endDate]); // Removed onSubmitRequest and reason from dependencies

  const calculateBusinessDays = (start, end) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    
    // Simple calculation - in real app would exclude weekends/holidays
    return daysDiff;
  };

  const requestedDays = calculateBusinessDays(startDate, endDate);
  const wouldRemain = ptoData.remaining === 'Unlimited' ? 'Unlimited' : ptoData.remaining - requestedDays;

  return (
    <div className="pto-request-container">
      {/* PTO Balance Card */}
      <div className="pto-balance-card">
        <div className="pto-header">
          <div className="pto-icon">🏖️</div>
          <div>
            <h3>Time Off Request</h3>
            <p>Your PTO balance for {ptoData.year}</p>
          </div>
        </div>

        <div className="pto-unlimited">
          <div className="unlimited-badge">Unlimited</div>
          <div className="unlimited-subtitle">Days left this year</div>
        </div>

        <div className="pto-stats-simple">
          <div className="stat-row">
            <span className="stat-label">PTO days taken</span>
            <span className="stat-value">{ptoData.used} days this year</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Policy</span>
            <span className="stat-value">{ptoData.policy}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Request approval</span>
            <span className="stat-value">{ptoData.approvalRequired}</span>
          </div>
        </div>


      </div>

      {/* Date Range Picker */}
      <div className="date-picker-section">
        <div className="section-header">
          <h4>Request Time Off</h4>
          <p>Select the dates you'd like to take off</p>
        </div>

        <div className="date-inputs">
          <div className="date-input-group">
            <label htmlFor="start-date">Start Date</label>
            <input
              type="date"
              id="start-date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          
          <div className="date-input-group">
            <label htmlFor="end-date">End Date</label>
            <input
              type="date"
              id="end-date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        {startDate && endDate && (
          <div className="request-summary">
            <div className="summary-header">
              <span>You've selected {requestedDays} days ({startDate} - {endDate})</span>
            </div>
            <div className="summary-details">
              <div className="summary-item">
                <span>• {new Date(startDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} through {new Date(endDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div className="summary-item">
                <span>• Using {requestedDays} business days of PTO</span>
              </div>
            </div>
            <div className="processing-message">
              <span>{hasSubmitted ? 'Request submitted!' : 'Processing your request...'}</span>
            </div>
          </div>
        )}
      </div>


    </div>
  );
};

export default PTORequestComponent;
