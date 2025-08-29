import React, { useState, useEffect } from 'react';
import './AIResponseSelector.css';

// Mock data - comprehensive employee database for AI simulation
const EMPLOYEE_DATABASE = {
  employees: [
    // Max variations
    { id: 1, name: 'Max Thompson', department: 'Engineering', role: 'Senior Engineer', salary: 120000, lastPaycheck: '2024-01-15', manager: 'Sarah Johnson' },
    { id: 2, name: 'Max Rodriguez', department: 'Marketing', role: 'Marketing Manager', salary: 95000, lastPaycheck: '2024-01-15', manager: 'Jennifer Davis' },
    { id: 3, name: 'Maxwell Chen', department: 'Sales', role: 'Sales Director', salary: 135000, lastPaycheck: '2024-01-10', manager: 'Michael Roberts' },
    { id: 4, name: 'Max Patel', department: 'Engineering', role: 'DevOps Engineer', salary: 110000, lastPaycheck: '2024-01-15', manager: 'David Kim' },

    // Other employees for context
    { id: 5, name: 'Sarah Johnson', department: 'Engineering', role: 'Engineering Manager', salary: 140000, lastPaycheck: '2024-01-15', manager: 'CEO' },
    { id: 6, name: 'Jennifer Davis', department: 'Marketing', role: 'Marketing Director', salary: 125000, lastPaycheck: '2024-01-15', manager: 'CEO' },
    { id: 7, name: 'Michael Roberts', department: 'Sales', role: 'VP of Sales', salary: 160000, lastPaycheck: '2024-01-10', manager: 'CEO' },
    { id: 8, name: 'David Kim', department: 'Engineering', role: 'CTO', salary: 200000, lastPaycheck: '2024-01-15', manager: 'CEO' },
    { id: 9, name: 'Lisa Wong', department: 'HR', role: 'HR Manager', salary: 105000, lastPaycheck: '2024-01-15', manager: 'CEO' },
    { id: 10, name: 'Alex Turner', department: 'Finance', role: 'CFO', salary: 180000, lastPaycheck: '2024-01-15', manager: 'CEO' }
  ],
  departments: [
    { id: 1, name: 'Engineering', headcount: 45, budget: 3200000 },
    { id: 2, name: 'Marketing', headcount: 23, budget: 1800000 },
    { id: 3, name: 'Sales', headcount: 31, budget: 2500000 },
    { id: 4, name: 'HR', headcount: 12, budget: 950000 },
    { id: 5, name: 'Finance', headcount: 15, budget: 1400000 }
  ],
  payrolls: [
    { id: 1, period: 'January 2024', totalPayroll: 1250000, employeeCount: 146, processedDate: '2024-01-15' },
    { id: 2, period: 'December 2023', totalPayroll: 1180000, employeeCount: 142, processedDate: '2024-01-01' },
    { id: 3, period: 'November 2023', totalPayroll: 1150000, employeeCount: 140, processedDate: '2023-12-01' }
  ]
};

const AIResponseSelector = ({ userQuery, position, onResponse, onClose }) => {
  const [candidates, setCandidates] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [aiResponse, setAiResponse] = useState('');
  const [showSelection, setShowSelection] = useState(true);

  useEffect(() => {
    // Analyze the user's query and find relevant candidates
    const analyzeQuery = (query) => {
      const lowerQuery = query.toLowerCase();
      const candidates = [];

      // Look for employee name queries
      if (lowerQuery.includes('paycheck') || lowerQuery.includes('salary') || lowerQuery.includes('latest') || lowerQuery.includes('last')) {
        // Extract potential names from the query
        const words = query.split(/\s+/);
        const potentialNames = [];

        // Look for capitalized words that might be names
        words.forEach(word => {
          if (word.length > 1 && word[0] === word[0].toUpperCase()) {
            potentialNames.push(word);
          }
        });

        // Also look for common name patterns
        EMPLOYEE_DATABASE.employees.forEach(employee => {
          const employeeName = employee.name.toLowerCase();
          if (lowerQuery.includes(employeeName) ||
              employeeName.split(' ').some(part => lowerQuery.includes(part))) {
            candidates.push({
              type: 'employee',
              data: employee,
              relevance: 'direct_match'
            });
          }
        });

        // If no direct matches but we have potential names, show all employees with those names
        if (candidates.length === 0 && potentialNames.length > 0) {
          potentialNames.forEach(name => {
            EMPLOYEE_DATABASE.employees.forEach(employee => {
              if (employee.name.toLowerCase().includes(name.toLowerCase())) {
                candidates.push({
                  type: 'employee',
                  data: employee,
                  relevance: 'name_match',
                  matchedName: name
                });
              }
            });
          });
        }
      }

      // Look for department queries
      if (lowerQuery.includes('department') || lowerQuery.includes('team') || lowerQuery.includes('group')) {
        EMPLOYEE_DATABASE.departments.forEach(dept => {
          if (lowerQuery.includes(dept.name.toLowerCase())) {
            candidates.push({
              type: 'department',
              data: dept,
              relevance: 'direct_match'
            });
          }
        });
      }

      // Look for payroll queries
      if (lowerQuery.includes('payroll') || lowerQuery.includes('total') || lowerQuery.includes('company')) {
        EMPLOYEE_DATABASE.payrolls.forEach(payroll => {
          if (lowerQuery.includes(payroll.period.toLowerCase()) ||
              lowerQuery.includes('latest') ||
              lowerQuery.includes('last') ||
              lowerQuery.includes('total')) {
            candidates.push({
              type: 'payroll',
              data: payroll,
              relevance: 'direct_match'
            });
          }
        });
      }

      return candidates.slice(0, 5); // Limit to 5 candidates
    };

    const foundCandidates = analyzeQuery(userQuery);
    setCandidates(foundCandidates);
    setSelectedIndex(0);

    // Generate initial AI response
    if (foundCandidates.length === 0) {
      setAiResponse("I couldn't find any matching information for your query. Try being more specific about names, departments, or payroll information.");
      setShowSelection(false);
    } else if (foundCandidates.length === 1) {
      // Only one match, provide direct response
      const response = generateResponse(foundCandidates[0]);
      setAiResponse(response);
      setShowSelection(false);
    } else {
      // Multiple matches, show selection
      setAiResponse(`I found ${foundCandidates.length} possible matches for your query. Please select which one you'd like information about:`);
      setShowSelection(true);
    }
  }, [userQuery]);

  const generateResponse = (candidate) => {
    switch (candidate.type) {
      case 'employee':
        const employee = candidate.data;
        return `Here's the information for **${employee.name}**:\n\n` +
               `• **Department**: ${employee.department}\n` +
               `• **Role**: ${employee.role}\n` +
               `• **Salary**: $${employee.salary.toLocaleString()}\n` +
               `• **Latest Paycheck**: ${employee.lastPaycheck}\n` +
               `• **Manager**: ${employee.manager}\n\n` +
               `Would you like more details or information about someone else?`;

      case 'department':
        const dept = candidate.data;
        return `**${dept.name} Department** information:\n\n` +
               `• **Headcount**: ${dept.headcount} employees\n` +
               `• **Annual Budget**: $${dept.budget.toLocaleString()}\n` +
               `• **Average Salary**: $${Math.round(dept.budget / dept.headcount / 12).toLocaleString()}/month\n\n` +
               `This is one of our core departments. Would you like details about specific team members?`;

      case 'payroll':
        const payroll = candidate.data;
        return `**${payroll.period} Payroll** summary:\n\n` +
               `• **Total Payroll**: $${payroll.totalPayroll.toLocaleString()}\n` +
               `• **Employee Count**: ${payroll.employeeCount}\n` +
               `• **Average Salary**: $${Math.round(payroll.totalPayroll / payroll.employeeCount).toLocaleString()}\n` +
               `• **Processed Date**: ${payroll.processedDate}\n\n` +
               `This covers all active employees for the period. Need information about a different payroll period?`;

      default:
        return "I found some information but couldn't process it properly. Please try rephrasing your question.";
    }
  };

  const handleSelect = (candidate) => {
    const response = generateResponse(candidate);
    onResponse(response);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showSelection || candidates.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev =>
            prev < candidates.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < candidates.length) {
            handleSelect(candidates[selectedIndex]);
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
  }, [candidates, selectedIndex, showSelection, onResponse, onClose]);

  const getCandidateIcon = (candidate) => {
    switch (candidate.type) {
      case 'employee':
        return '👤';
      case 'department':
        return '🏢';
      case 'payroll':
        return '💰';
      default:
        return '📋';
    }
  };

  const getCandidateSummary = (candidate) => {
    switch (candidate.type) {
      case 'employee':
        return `${candidate.data.role} in ${candidate.data.department}`;
      case 'department':
        return `${candidate.data.headcount} employees, $${candidate.data.budget.toLocaleString()} budget`;
      case 'payroll':
        return `$${candidate.data.totalPayroll.toLocaleString()} for ${candidate.data.employeeCount} employees`;
      default:
        return candidate.data.name || 'Unknown';
    }
  };

  return (
    <div
      className="ai-response-selector"
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        zIndex: 1000
      }}
    >
      <div className="ai-header">
        <span className="ai-icon">🤖</span>
        <span className="ai-title">AI Assistant</span>
        <button className="ai-close" onClick={onClose}>×</button>
      </div>

      <div className="ai-content">
        <div className="ai-message">
          {aiResponse}
        </div>

        {showSelection && candidates.length > 0 && (
          <div className="ai-candidates">
            <div className="candidates-title">Please select:</div>
            {candidates.map((candidate, index) => (
              <div
                key={`${candidate.type}-${candidate.data.id}`}
                className={`candidate-item ${selectedIndex === index ? 'selected' : ''}`}
                onClick={() => handleSelect(candidate)}
              >
                <span className="candidate-icon">{getCandidateIcon(candidate)}</span>
                <div className="candidate-info">
                  <div className="candidate-name">{candidate.data.name}</div>
                  <div className="candidate-summary">{getCandidateSummary(candidate)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="ai-footer">
        <div className="ai-shortcuts">
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
      </div>
    </div>
  );
};

export default AIResponseSelector;
