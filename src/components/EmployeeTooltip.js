import React, { useState } from 'react';
import './EmployeeTooltip.css';

const EmployeeTooltip = ({ employee, name }) => {
  const [isVisible, setIsVisible] = useState(false);

  const showTooltip = () => setIsVisible(true);
  const hideTooltip = () => setIsVisible(false);

  if (!employee) {
    return <span className="employee-name-interactive">{name}</span>;
  }

  return (
    <span 
      className="employee-name-interactive"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      {name}
      {isVisible && (
        <div className="employee-tooltip">
          <div className="tooltip-header">
            <div className="tooltip-avatar">
              {employee.avatar || '👤'}
            </div>
            <div className="tooltip-basic-info">
              <div className="tooltip-name">{employee.name}</div>
              <div className="tooltip-role">{employee.role}</div>
            </div>
          </div>
          <div className="tooltip-details">
            <div className="tooltip-row">
              <span className="tooltip-label">Department:</span>
              <span className="tooltip-value">{employee.department}</span>
            </div>
            <div className="tooltip-row">
              <span className="tooltip-label">Manager:</span>
              <span className="tooltip-value">{employee.manager}</span>
            </div>
            <div className="tooltip-row">
              <span className="tooltip-label">Salary:</span>
              <span className="tooltip-value">${employee.salary?.toLocaleString()}</span>
            </div>
            <div className="tooltip-row">
              <span className="tooltip-label">Last Paycheck:</span>
              <span className="tooltip-value">{employee.lastPaycheck}</span>
            </div>
          </div>
        </div>
      )}
    </span>
  );
};

export default EmployeeTooltip;
