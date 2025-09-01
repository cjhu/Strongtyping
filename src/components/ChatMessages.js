import React, { useState } from 'react';
import PTORequestComponent from './PTORequestComponent';
import ThinkingComponent from './ThinkingComponent';

const ChatMessages = ({ messages, onSendMessage, onUndo }) => {
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [lastDisambiguationContent, setLastDisambiguationContent] = useState(null);

  // Mock employee database for AI responses
  const EMPLOYEE_DATABASE = {
    employees: [
      { id: 1, name: 'Max Frothingham', department: 'Product', role: 'Product Designer', salary: 115000, lastPaycheck: '2024-01-15', manager: 'Sarah Johnson' },
      { id: 2, name: 'Max Jasso Jr.', department: 'Engineering', role: 'Director of QE', salary: 145000, lastPaycheck: '2024-01-15', manager: 'Jennifer Davis' },
      { id: 3, name: 'Max Levchin', department: 'Engineering', role: 'Software Engineer', salary: 125000, lastPaycheck: '2024-01-10', manager: 'Michael Roberts' },
      { id: 4, name: 'Max Wesel', department: 'Engineering', role: 'CTO', salary: 220000, lastPaycheck: '2024-01-15', manager: 'CEO' },
      { id: 5, name: 'Sarah Johnson', department: 'Engineering', role: 'Engineering Manager', salary: 140000, lastPaycheck: '2024-01-15', manager: 'CEO' },
      { id: 6, name: 'Jennifer Davis', department: 'Marketing', role: 'Marketing Director', salary: 125000, lastPaycheck: '2024-01-15', manager: 'CEO' },
      { id: 7, name: 'Michael Roberts', department: 'Sales', role: 'VP of Sales', salary: 160000, lastPaycheck: '2024-01-10', manager: 'CEO' },
      { id: 8, name: 'David Kim', department: 'Engineering', role: 'CTO', salary: 200000, lastPaycheck: '2024-01-15', manager: 'CEO' },
      { id: 9, name: 'Lisa Wong', department: 'HR', role: 'HR Manager', salary: 105000, lastPaycheck: '2024-01-15', manager: 'CEO' },
      { id: 10, name: 'Alex Turner', department: 'Finance', role: 'CFO', salary: 180000, lastPaycheck: '2024-01-15', manager: 'CEO' }
    ]
  };

  // Mock PTO data for current user
  const PTO_DATA = {
    currentUser: 'Jared Hu',
    policy: 'Unlimited / North America',
    year: 2025,
    totalAllowed: 'Unlimited', // Unlimited policy
    used: 5, // days
    remaining: 'Unlimited', // Unlimited remaining
    pendingRequests: 0, // days
    approvalRequired: 'Manager only'
  };

  // Debug function to help understand what queries are being processed
  const debugQuery = (userMessage) => {
    console.log('🔍 AI Query Debug:', {
      original: userMessage,
      lowercase: userMessage.toLowerCase(),
      words: userMessage.split(/\s+/),
      isAIQuery: isAIQuery(userMessage)
    });
  };

  // Detect if a message is an AI query
  const isAIQuery = (message) => {
    // Skip AI query detection if message already contains strong-typed chips
    const chipRegex = /\{\{([^:]+):([^}]+)\}\}/g;
    if (chipRegex.test(message)) {
      console.log('⏭️ Skipping AI query detection - message already has strong-typed chips');
      return false;
    }

    const lowerMessage = message.toLowerCase().trim();

    // Must be a question, query, or action request
    if (!lowerMessage.includes('?') &&
        !lowerMessage.startsWith('what') &&
        !lowerMessage.startsWith('who') &&
        !lowerMessage.startsWith('how') &&
        !lowerMessage.startsWith('when') &&
        !lowerMessage.startsWith('where') &&
        !lowerMessage.startsWith('i need') &&
        !lowerMessage.startsWith('i want') &&
        !lowerMessage.includes('tell me') &&
        !lowerMessage.includes('show me') &&
        !lowerMessage.includes('give me') &&
        !lowerMessage.includes('find') &&
        !lowerMessage.includes('get')) {
      return false;
    }

    // Look for employee/payroll/PTO related keywords
    const queryKeywords = [
      'paycheck', 'salary', 'payroll', 'employee', 'person',
      'department', 'team', 'manager', 'latest', 'last',
      'total', 'budget', 'headcount', 'role', 'position',
      'time off', 'pto', 'vacation', 'leave', 'days off'
    ];

    const hasQueryKeyword = queryKeywords.some(keyword =>
      lowerMessage.includes(keyword)
    );

    return hasQueryKeyword;
  };

  // Generate PTO response with balance and date picker
  const generatePTOResponse = () => {
    return JSON.stringify({
      type: 'pto_request',
      data: PTO_DATA
    });
  };

  // Generate AI response with ambiguity resolution
  const generateAIResponse = (userMessage) => {
    debugQuery(userMessage); // Debug what query is being processed
    const lowerMessage = userMessage.toLowerCase();

    // Check if it's a PTO request
    if (lowerMessage.includes('time off') || lowerMessage.includes('pto') || 
        lowerMessage.includes('vacation') || lowerMessage.includes('leave') ||
        lowerMessage.includes('i need to take')) {
      return generatePTOResponse();
    }

    // Find potential matches
    const candidates = [];

    // Look for employee-related queries (expanded triggers)
    if (lowerMessage.includes('paycheck') ||
        lowerMessage.includes('salary') ||
        lowerMessage.includes('who') ||
        lowerMessage.includes('what') ||
        lowerMessage.includes('tell me') ||
        lowerMessage.includes('about') ||
        lowerMessage.includes('employee') ||
        lowerMessage.includes('person') ||
        lowerMessage.includes('department') ||
        lowerMessage.includes('team') ||
        lowerMessage.includes('manager')) {

      // Extract potential names (more flexible approach)
      const words = userMessage.split(/\s+/);
      const potentialNames = words.filter(word => {
        const cleanWord = word.replace(/[?!.,'"`]/g, ''); // Remove punctuation
        return cleanWord.length > 1 &&
               !['what', 'who', 'how', 'when', 'where', 'the', 'is', 'are', 'do', 'does', 'tell', 'me', 'about', 'a', 'an'].includes(cleanWord.toLowerCase());
      });

      // Also try common names that might not be capitalized
      const commonNames = ['max', 'john', 'sarah', 'jennifer', 'michael', 'david', 'lisa', 'alex'];
      const lowerMessageWords = lowerMessage.split(/\s+/);
      const additionalNames = lowerMessageWords.filter(word => {
        const cleanWord = word.replace(/[?!.,'"`]/g, '');
        return cleanWord.length > 1 &&
               commonNames.includes(cleanWord.toLowerCase()) &&
               !['what', 'who', 'how', 'when', 'where', 'the', 'is', 'are', 'do', 'does'].includes(cleanWord.toLowerCase());
      });

      // Combine both lists
      const allPotentialNames = [...potentialNames, ...additionalNames];

      // Also try partial matches and common name variations
      allPotentialNames.forEach(name => {
        const cleanName = name.replace(/[?!.,'"`]/g, '');
        EMPLOYEE_DATABASE.employees.forEach(employee => {
          const employeeName = employee.name.toLowerCase();
          const searchName = cleanName.toLowerCase();

          // Check for exact match, partial match, or first/last name match
          if (employeeName.includes(searchName) ||
              searchName.includes(employeeName.split(' ')[0]) ||
              searchName.includes(employeeName.split(' ')[1]) ||
              employeeName.split(' ')[0].includes(searchName) ||
              employeeName.split(' ')[1]?.includes(searchName)) {
            candidates.push({
              type: 'employee',
              data: employee,
              relevance: 'name_match'
            });
          }
        });
      });

      // If no name-specific matches found, try department queries
      if (candidates.length === 0) {
        // Check for department queries
        const departments = ['engineering', 'marketing', 'sales', 'hr', 'finance', 'human resources'];
        const mentionedDept = departments.find(dept => lowerMessage.includes(dept));

        if (mentionedDept) {
          EMPLOYEE_DATABASE.employees.forEach(employee => {
            if (employee.department.toLowerCase().includes(mentionedDept) ||
                mentionedDept.includes(employee.department.toLowerCase())) {
              candidates.push({
                type: 'employee',
                data: employee,
                relevance: 'department_match'
              });
            }
          });
        }
      }
    }

    // Handle different response scenarios
    if (candidates.length === 0) {
      // Provide helpful suggestions based on query type
      if (lowerMessage.includes('department') || lowerMessage.includes('team')) {
        return "I can help you with information about departments. Try asking about:\n\n• Engineering department\n• Marketing team\n• Sales department\n• HR department\n• Finance department\n\nOr ask about specific employees!";
      } else if (lowerMessage.includes('manager') || lowerMessage.includes('who')) {
        return "I can help you find information about managers. Try asking:\n\n• Who manages Engineering?\n• Who is the manager of Marketing?\n• Tell me about Sarah Johnson (Engineering Manager)\n\nI have information about all department managers!";
      } else {
        return "I couldn't find any matching information. Try asking about:\n\n• Specific employees (e.g., 'What's Max's latest paycheck?')\n• Departments (e.g., 'Who manages Engineering?')\n• Payroll information (e.g., 'What's the salary for John Johnson?')\n\nI have data for 10 employees across 5 departments!";
      }
    } else if (candidates.length === 1) {
      // Single match - provide direct response
      return generateDetailedResponse(candidates[0]);
    } else {
      // Multiple matches - show selection options
      const ambiguityResponse = generateAmbiguityResponse(candidates);
      setLastDisambiguationContent(ambiguityResponse);
      return ambiguityResponse;
    }
  };

  // Generate detailed response for single match
  const generateDetailedResponse = (candidate) => {
    const employee = candidate.data;
    
    // If it's a paycheck query, return detailed paycheck card
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.content.toLowerCase().includes('paycheck')) {
      return `Here's **${employee.name}'s** latest paycheck:

<div class="paycheck-card">
<div class="paycheck-header">
<div class="paycheck-title">Paycheck</div>
<div class="paycheck-date">08/01/2025 - 08/15/2025</div>
</div>

<div class="gross-pay-section">
<div class="gross-pay-label">Gross pay</div>
<div class="gross-pay-amount">$ 5,769.23</div>
</div>

<div class="paycheck-details">
<div class="detail-column">
<div class="detail-label">Gross pay</div>
<div class="detail-amount">$ 5,769.23</div>
</div>
<div class="detail-column">
<div class="detail-label">Taxes</div>
<div class="detail-amount">$ 1,442.31</div>
</div>
<div class="detail-column">
<div class="detail-label">Deductions</div>
<div class="detail-amount">$ 479.30</div>
</div>
</div>

<div class="paycheck-breakdown">
<div class="breakdown-row">
<span class="breakdown-label">Regular pay</span>
<span class="breakdown-amount positive">$ 5,769.23</span>
</div>
<div class="breakdown-row">
<span class="breakdown-label">Federal tax</span>
<span class="breakdown-amount negative">- $865.38</span>
</div>
<div class="breakdown-row">
<span class="breakdown-label">State tax (CA)</span>
<span class="breakdown-amount negative">- $346.15</span>
</div>
<div class="breakdown-row">
<span class="breakdown-label">Benefits</span>
<span class="breakdown-amount negative">- $250.00</span>
</div>
<div class="breakdown-row">
<span class="breakdown-label">401(k)</span>
<span class="breakdown-amount negative">- $346.16</span>
</div>
</div>
</div>`;
    }
    
    // Default employee information response
    return `**${employee.name}** information:\n\n` +
           `• **Department**: ${employee.department}\n` +
           `• **Role**: ${employee.role}\n` +
           `• **Salary**: $${employee.salary.toLocaleString()}\n` +
           `• **Latest Paycheck**: ${employee.lastPaycheck}\n` +
           `• **Manager**: ${employee.manager}\n\n` +
           `Would you like more details or information about someone else?`;
  };

  // Generate response with ambiguity options
  const generateAmbiguityResponse = (candidates) => {
    const options = candidates.map((candidate, index) =>
      `**${index + 1}. ${candidate.data.name}**\n   ${candidate.data.role} in ${candidate.data.department}`
    ).join('\n\n');

    return `I found ${candidates.length} possible matches. Which one do you mean?\n\n${options}\n\nReply with the number (1-${candidates.length}) to select.`;
  };

  // Handle user selection from ambiguity response
  const handleCandidateSelection = (candidateIndex) => {
    // This would be called when user clicks/selects from the chat
    const aiResponse = generateDetailedResponse({ data: selectedCandidate });
    onSendMessage(aiResponse);
    setSelectedCandidate(null);
  };

  // Parse message content to render chips
  const parseMessageContent = (content) => {
    // Regex to match chip format: {{Name:Type}}
    const chipRegex = /\{\{([^:]+):([^}]+)\}\}/g;

    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = chipRegex.exec(content)) !== null) {
      // Add text before the chip
      if (match.index > lastIndex) {
        parts.push(content.substring(lastIndex, match.index));
      }

      // Add the chip
      const name = match[1];
      const type = match[2];
      parts.push(
        <span key={match.index} className={`object-chip object-chip-${type}`}>
          <span className="chip-icon">
            {getChipIcon(type)}
          </span>
          <span className="chip-text">{name}</span>
        </span>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }

    return parts.length > 0 ? parts : content;
  };

  // Get appropriate icon for chip type
  const getChipIcon = (type) => {
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

  // Auto-generate AI responses for user queries
  React.useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.isUser && isAIQuery(lastMessage.content)) {
      // Show thinking process with steps
      const thinkingSteps = generateThinkingSteps(lastMessage.content);
      
      setTimeout(() => {
        onSendMessage(JSON.stringify({
          type: 'thinking',
          steps: thinkingSteps,
          query: lastMessage.content
        }), false);
      }, 500);

      // Generate AI response after thinking process completes
      const totalThinkingTime = thinkingSteps.reduce((total, step) => total + step.duration, 0);
      setTimeout(() => {
        const aiResponse = generateAIResponse(lastMessage.content);
        onSendMessage(aiResponse, false); // AI response is not from user
      }, 500 + totalThinkingTime + 500); // Base delay + thinking time + buffer
    }
  }, [messages]);

  // Generate realistic thinking steps based on the query
  const generateThinkingSteps = (query) => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('time off') || lowerQuery.includes('pto') || 
        lowerQuery.includes('vacation') || lowerQuery.includes('leave') ||
        lowerQuery.includes('i need to take')) {
      return [
        {
          id: 1,
          text: "Parsing request: Time off request for Jared Hu",
          duration: 300,
          type: "parsing"
        },
        {
          id: 2,
          text: "Looking up current PTO balance and policy...",
          duration: 600,
          type: "lookup"
        },
        {
          id: 3,
          text: "Retrieving PTO history and usage patterns...",
          duration: 500,
          type: "retrieval"
        },
        {
          id: 4,
          text: "Checking pending requests and availability...",
          duration: 400,
          type: "verification"
        },
        {
          id: 5,
          text: "Preparing PTO dashboard and date picker...",
          duration: 700,
          type: "preparation"
        }
      ];
    } else if (lowerQuery.includes('paycheck') || lowerQuery.includes('pay')) {
      return [
        {
          id: 1,
          text: "Parsing request: Pay information request",
          duration: 300,
          type: "parsing"
        },
        {
          id: 2,
          text: "Looking up employee payroll records...",
          duration: 500,
          type: "lookup"
        },
        {
          id: 3,
          text: "Retrieving latest paystub (Aug 1 - Aug 15 2025)...",
          duration: 400,
          type: "retrieval"
        },
        {
          id: 4,
          text: "Calculating expected vs actual amounts...",
          duration: 500,
          type: "calculation"
        },
        {
          id: 5,
          text: "Formatting paycheck details...",
          duration: 300,
          type: "preparation"
        }
      ];
    } else if (lowerQuery.includes('who') || lowerQuery.includes('employee')) {
      return [
        {
          id: 1,
          text: "Parsing employee search query...",
          duration: 200,
          type: "parsing"
        },
        {
          id: 2,
          text: "Searching employee database...",
          duration: 600,
          type: "lookup"
        },
        {
          id: 3,
          text: "Checking for multiple matches...",
          duration: 400,
          type: "verification"
        },
        {
          id: 4,
          text: "Preparing employee information...",
          duration: 300,
          type: "preparation"
        }
      ];
    } else {
      return [
        {
          id: 1,
          text: "Understanding your request...",
          duration: 300,
          type: "parsing"
        },
        {
          id: 2,
          text: "Searching relevant data sources...",
          duration: 700,
          type: "lookup"
        },
        {
          id: 3,
          text: "Analyzing available information...",
          duration: 500,
          type: "analysis"
        },
        {
          id: 4,
          text: "Preparing response...",
          duration: 400,
          type: "preparation"
        }
      ];
    }
  };

  // Handle selection from ambiguity options
  const handleAmbiguitySelection = (candidateIndex, candidates) => {
    if (candidateIndex >= 0 && candidateIndex < candidates.length) {
      const selectedCandidate = candidates[candidateIndex];
      
      // Check if this is a PTO confirmation response
      if (selectedCandidate.data && selectedCandidate.data.response) {
        onSendMessage(selectedCandidate.data.response, false);
        return;
      }
      
      const response = generateDetailedResponse(selectedCandidate);
      
      // Mark this response as undoable if it came from disambiguation
      const canUndo = lastDisambiguationContent !== null;
      const undoData = canUndo ? {
        originalDisambiguationContent: lastDisambiguationContent,
        selectedCandidateIndex: candidateIndex,
        allCandidates: candidates
      } : null;
      
      onSendMessage(response, false, canUndo, undoData); // AI response with undo capability
      
      // Clear the disambiguation content after use
      setLastDisambiguationContent(null);
    }
  };

  return (
    <div className="chat-messages">
      {messages.length === 0 ? (
        <div className="chat-empty-state">
          <div className="empty-icon">💬</div>
          <h4>Let's start working</h4>
          <p>Search, create, delete or make changes across all of Rippling. Here's some ideas to get started:</p>
          <p>• Use <strong>@</strong> to insert employees, departments, or other objects</p>
          <p>• Ask questions like "What's Max's latest paycheck?"</p>
          <p>• Say "I need to take some time off" to request PTO</p>
        </div>
      ) : (
        messages.map(message => {
          const isAIQueryMessage = message.isUser && isAIQuery(message.content);

          return (
            <div key={message.id} className={`message ${message.isUser ? 'user' : 'assistant'}`}>
              <div className="message-avatar">
                {message.isUser ? 'J' : '🤖'}
              </div>
              <div className="message-bubble">
                <div className="message-content">
                  {message.isUser ? (
                    parseMessageContent(message.content)
                  ) : message.content.startsWith('{"type":"thinking"') ? (
                    <ThinkingComponent content={message.content} />
                  ) : (
                    <AIReplyContent
                      content={message.content}
                      isAIQuery={isAIQueryMessage}
                      onCandidateSelect={handleAmbiguitySelection}
                    />
                  )}
                </div>
                <div className="message-timestamp">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
              {!message.isUser && message.canUndo && (
                <div className="undo-button" onClick={() => onUndo(message.id)} title="Undo selection">
                  ↶
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

// Component to render AI replies with interactive options
const AIReplyContent = ({ content, isAIQuery, onCandidateSelect }) => {
  // Check if content contains HTML (like paycheck cards)
  if (content.includes('<div class="paycheck-card">')) {
    return <div dangerouslySetInnerHTML={{ __html: content }} />;
  }

  // Check if content is a PTO request
  try {
    const parsedContent = JSON.parse(content);
    if (parsedContent.type === 'pto_request') {
      const handlePTOSubmit = (requestData) => {
        const startDate = new Date(requestData.startDate);
        const endDate = new Date(requestData.endDate);
        const formattedStart = startDate.toLocaleDateString('en-US', { 
          month: 'short', day: 'numeric', year: 'numeric' 
        });
        const formattedEnd = endDate.toLocaleDateString('en-US', { 
          month: 'short', day: 'numeric', year: 'numeric' 
        });
        
        const confirmationMessage = `Should I submit this request to your manager Patricia Gonzalez for approval? You can add some additional notes, too.`;
        
        onCandidateSelect && onCandidateSelect(0, [{ 
          data: { response: confirmationMessage } 
        }]);
      };

      return <PTORequestComponent 
        ptoData={parsedContent.data} 
        onSubmitRequest={handlePTOSubmit}
      />;
    }
  } catch (e) {
    // Not JSON, continue with normal parsing
  }

  // Parse content to identify ambiguity options
  const parseAIContent = (text) => {
    const lines = text.split('\n');
    const parts = [];
    let candidates = [];
    let isInOptions = false;

    lines.forEach((line, index) => {
      // Check if this line contains ambiguity options
      const optionMatch = line.match(/^\*\*(\d+)\.\s*(.+)\*\*$/);
      if (optionMatch) {
        isInOptions = true;
        const optionNumber = parseInt(optionMatch[1]) - 1; // Convert to 0-based index
        const optionText = optionMatch[2];

        candidates.push({
          index: optionNumber,
          text: optionText,
          details: lines[index + 1]?.replace(/^\s+/, '') || '' // Next line with details
        });

        parts.push(
          <div key={index} className="ai-option">
            <button
              className="option-button"
              onClick={() => onCandidateSelect && onCandidateSelect(optionNumber, candidates)}
            >
              {optionNumber + 1}. {optionText}
            </button>
            {lines[index + 1] && (
              <div className="option-details">{lines[index + 1].replace(/^\s+/, '')}</div>
            )}
          </div>
        );
      } else if (!isInOptions || line.trim() === '') {
        // Regular text or spacing
        if (line.trim()) {
          parts.push(
            <div key={index} className="ai-text-line">
              {parseBoldText(line)}
            </div>
          );
        } else {
          parts.push(<br key={index} />);
        }
      }
    });

    return parts.length > 0 ? parts : text;
  };

  // Parse bold text (marked with **text**)
  const parseBoldText = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);

    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const boldText = part.slice(2, -2);
        return <strong key={index}>{boldText}</strong>;
      }
      return part;
    });
  };

  if (isAIQuery) {
    // For AI query responses, parse and make interactive
    return <div className="ai-reply-content">{parseAIContent(content)}</div>;
  } else {
    // For regular AI responses, just parse bold text
    return <div className="ai-reply-content">{parseBoldText(content)}</div>;
  }
};

export default ChatMessages;
