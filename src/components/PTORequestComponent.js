import React, { useState } from 'react';
import './PTORequestComponent.css';

const PTORequestComponent = ({ ptoData, onSubmitRequest }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const handleSubmitRequest = () => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      
      onSubmitRequest({
        startDate,
        endDate,
        days: daysDiff,
        reason: reason || 'Personal time off'
      });
      
      // Reset form
      setStartDate('');
      setEndDate('');
      setReason('');
      setIsDatePickerOpen(false);
    }
  };

  const calculateBusinessDays = (start, end) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    
    // Simple calculation - in real app would exclude weekends/holidays
    return daysDiff;
  };

  const requestedDays = calculateBusinessDays(startDate, endDate);
  const wouldRemain = ptoData.remaining - requestedDays;

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

        <div className="pto-stats">
          <div className="pto-stat">
            <div className="stat-label">Total Allowed</div>
            <div className="stat-value">{ptoData.totalAllowed} days</div>
          </div>
          <div className="pto-stat">
            <div className="stat-label">Used</div>
            <div className="stat-value used">{ptoData.used} days</div>
          </div>
          <div className="pto-stat">
            <div className="stat-label">Remaining</div>
            <div className="stat-value remaining">{ptoData.remaining} days</div>
          </div>
        </div>

        <div className="pto-progress">
          <div className="progress-bar">
            <div 
              className="progress-used" 
              style={{ width: `${(ptoData.used / ptoData.totalAllowed) * 100}%` }}
            ></div>
            <div 
              className="progress-pending" 
              style={{ 
                width: `${(ptoData.pendingRequests / ptoData.totalAllowed) * 100}%`,
                left: `${(ptoData.used / ptoData.totalAllowed) * 100}%`
              }}
            ></div>
          </div>
          <div className="progress-labels">
            <span>0 days</span>
            <span>{ptoData.totalAllowed} days</span>
          </div>
        </div>

        <div className="pto-policy">
          <span className="policy-label">Policy:</span>
          <span className="policy-name">{ptoData.policy}</span>
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

        <div className="reason-input">
          <label htmlFor="reason">Reason (optional)</label>
          <input
            type="text"
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g., Family vacation, Personal day..."
          />
        </div>

        {startDate && endDate && (
          <div className="request-summary">
            <div className="summary-row">
              <span>Requested Days:</span>
              <span className="summary-value">{requestedDays} days</span>
            </div>
            <div className="summary-row">
              <span>Remaining After:</span>
              <span className={`summary-value ${wouldRemain < 0 ? 'negative' : ''}`}>
                {wouldRemain} days
              </span>
            </div>
            {wouldRemain < 0 && (
              <div className="warning">
                ⚠️ This request exceeds your available PTO balance
              </div>
            )}
          </div>
        )}

        <div className="action-buttons">
          <button 
            className="submit-button"
            onClick={handleSubmitRequest}
            disabled={!startDate || !endDate || wouldRemain < 0}
          >
            Submit Request
          </button>
          <button 
            className="cancel-button"
            onClick={() => {
              setStartDate('');
              setEndDate('');
              setReason('');
            }}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Recent Time Off */}
      {ptoData.usedBreakdown && ptoData.usedBreakdown.length > 0 && (
        <div className="recent-pto">
          <h4>Recent Time Off</h4>
          <div className="pto-history">
            {ptoData.usedBreakdown.map((entry, index) => (
              <div key={index} className="pto-entry">
                <div className="entry-date">{entry.date}</div>
                <div className="entry-details">
                  <span className="entry-reason">{entry.reason}</span>
                  <span className="entry-days">{entry.days} days</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PTORequestComponent;
