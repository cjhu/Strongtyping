import React, { useState, useEffect, useRef } from 'react';
import PTORequestComponent from './PTORequestComponent';
import ThinkingComponent from './ThinkingComponent';
import DisambiguationDropdownNew from './DisambiguationDropdownNew';
import EmployeeTooltip from './EmployeeTooltip';
import ErrorBoundary from './ErrorBoundary';

const ChatMessages = ({ messages, onSendMessage, onUndo }) => {
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [lastDisambiguationContent, setLastDisambiguationContent] = useState(null);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Auto-scroll to bottom function
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  };

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-scroll after a short delay for dynamic content (like thinking animations)
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [messages.length]);

  // Mock employee database for AI responses
  const EMPLOYEE_DATABASE = {
    employees: [
      { id: 1, name: 'Max Frothingham', department: 'Product', role: 'Product Designer', salary: 115000, lastPaycheck: '2024-01-15', manager: 'Sarah Johnson', avatar: '👨🏻‍💼' },
      { id: 2, name: 'Max Jasso Jr.', department: 'Engineering', role: 'Director of QE', salary: 145000, lastPaycheck: '2024-01-15', manager: 'Jennifer Davis', avatar: '👨🏽‍💻' },
      { id: 3, name: 'Max Levchin', department: 'Engineering', role: 'Software Engineer', salary: 125000, lastPaycheck: '2024-01-10', manager: 'Michael Roberts', avatar: '👨🏻‍💻' },
      { id: 4, name: 'Max Wesel', department: 'Engineering', role: 'CTO', salary: 220000, lastPaycheck: '2024-01-15', manager: 'CEO', avatar: '👨🏼‍💼' },
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

  // Check for typos in a single name - but avoid false positives for valid names
  const checkForTypoInName = (nameToCheck) => {
    try {
      if (!nameToCheck || nameToCheck.length < 3) return null;
      
      const searchName = nameToCheck.toLowerCase();
      
      // First, check if this is an exact or close match to any employee name
      // If so, don't treat it as a typo - let normal matching handle it
      for (const employee of EMPLOYEE_DATABASE.employees) {
        if (!employee || !employee.name) continue;
        
        const firstName = employee.name.split(' ')[0]?.toLowerCase() || '';
        const lastName = employee.name.split(' ')[1]?.toLowerCase() || '';
        
        // If it's an exact match or very close match, don't treat as typo
        if (searchName === firstName || 
            searchName === lastName ||
            firstName.includes(searchName) ||
            lastName.includes(searchName) ||
            searchName.includes(firstName)) {
          console.log(`DEBUG: "${nameToCheck}" is too close to "${employee.name}" - not a typo`);
          return null; // Not a typo, let normal matching handle it
        }
      }
      
      // Only check for fuzzy matching if it's not a close match to existing names
      for (const employee of EMPLOYEE_DATABASE.employees) {
        if (!employee || !employee.name) continue;
        
        const fullName = employee.name.toLowerCase();
        const firstName = employee.name.split(' ')[0]?.toLowerCase() || '';
        const lastName = employee.name.split(' ')[1]?.toLowerCase() || '';
        
        // Check for similar names (fuzzy matching for actual typos)
        if (isSimilar(searchName, firstName) || 
            isSimilar(searchName, lastName) || 
            isSimilar(searchName, fullName.replace(/\s+/g, ''))) {
          console.log(`DEBUG: "${nameToCheck}" appears to be a typo of "${employee.name}"`);
          return `I couldn't find any ${nameToCheck} in the system. Are you referring to {{${employee.name}:employee}}?`;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error in checkForTypoInName:', error);
      return null;
    }
  };

  // Check for typos and suggest corrections
  const checkForTypos = (userMessage) => {
    try {
      const words = userMessage.toLowerCase().split(/\s+/);
      
      // Look for potential name typos
      for (const word of words) {
        const cleanWord = word.replace(/[?!.,'"`]/g, '');
        if (cleanWord.length < 3) continue;
        
        // Check against employee names
        for (const employee of EMPLOYEE_DATABASE.employees) {
          if (!employee || !employee.name) continue;
          
          const fullName = employee.name.toLowerCase();
          const firstName = employee.name.split(' ')[0]?.toLowerCase() || '';
          const lastName = employee.name.split(' ')[1]?.toLowerCase() || '';
          
          // Check for similar names (simple fuzzy matching)
          if (isSimilar(cleanWord, firstName) || isSimilar(cleanWord, lastName) || isSimilar(cleanWord, fullName.replace(/\s+/g, ''))) {
            return `I couldn't find any ${cleanWord} in the system. There are many employees with the first name "Max." Are you referring to {{${employee.name}:employee}}?`;
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error in checkForTypos:', error);
      return null;
    }
  };

  // Simple fuzzy matching function
  const isSimilar = (input, target) => {
    if (input === target) return true;
    if (Math.abs(input.length - target.length) > 3) return false;
    
    // Check for common typos and similarities
    const inputClean = input.toLowerCase();
    const targetClean = target.toLowerCase();
    
    // Check if input contains significant portion of target
    if (inputClean.includes(targetClean.substring(0, Math.min(4, targetClean.length)))) return true;
    if (targetClean.includes(inputClean.substring(0, Math.min(4, inputClean.length)))) return true;
    
    // Calculate Levenshtein distance for closer matching
    const distance = levenshteinDistance(inputClean, targetClean);
    const maxLength = Math.max(inputClean.length, targetClean.length);
    const similarity = 1 - (distance / maxLength);
    
    return similarity > 0.6; // 60% similarity threshold
  };

  // Calculate Levenshtein distance
  const levenshteinDistance = (str1, str2) => {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
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
    try {
      console.log('generateAIResponse called with:', userMessage);
      debugQuery(userMessage); // Debug what query is being processed
      const lowerMessage = userMessage.toLowerCase();

      // Check if it's a PTO request
      if (lowerMessage.includes('time off') || lowerMessage.includes('pto') || 
          lowerMessage.includes('vacation') || lowerMessage.includes('leave') ||
          lowerMessage.includes('i need to take')) {
        console.log('Detected PTO request');
        return generatePTOResponse();
      }

      // Find potential matches first (before typo checking)
      console.log('Looking for employee matches...');
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
      
      // Expanded stop words to filter out non-names
      const stopWords = [
        'what', 'who', 'how', 'when', 'where', 'the', 'is', 'are', 'do', 'does', 
        'tell', 'me', 'about', 'a', 'an', 'show', 'latest', 'paycheck', 'salary',
        'payroll', 'get', 'find', 'lookup', 'see', 'give', 'want', 'need'
      ];
      
      const potentialNames = words.filter(word => {
        // Handle possessive forms - remove 's at the end
        let cleanWord = word.replace(/[?!.,'"`]/g, ''); // Remove punctuation
        if (cleanWord.endsWith("'s")) {
          cleanWord = cleanWord.slice(0, -2); // Remove 's
        }
        return cleanWord.length > 1 && !stopWords.includes(cleanWord.toLowerCase());
      });

      // Also try common names that might not be capitalized
      const commonNames = ['max', 'john', 'sarah', 'jennifer', 'michael', 'david', 'lisa', 'alex'];
      const lowerMessageWords = lowerMessage.split(/\s+/);
      const additionalNames = lowerMessageWords.filter(word => {
        let cleanWord = word.replace(/[?!.,'"`]/g, '');
        if (cleanWord.endsWith("'s")) {
          cleanWord = cleanWord.slice(0, -2);
        }
        console.log(`DEBUG: Checking common name: "${word}" → "${cleanWord}" against:`, commonNames);
        const isCommonName = commonNames.includes(cleanWord.toLowerCase());
        const isNotStopWord = !stopWords.includes(cleanWord.toLowerCase());
        console.log(`DEBUG: Is "${cleanWord}" a common name?`, isCommonName, 'Not stop word?', isNotStopWord);
        return cleanWord.length > 1 &&
               isCommonName &&
               isNotStopWord;
      });

      // Combine both lists and remove duplicates
      const allPotentialNames = [...new Set([...potentialNames, ...additionalNames])];

      console.log('DEBUG: Input message:', userMessage);
      console.log('DEBUG: All words:', words);
      console.log('DEBUG: Potential names (after filtering):', potentialNames);
      console.log('DEBUG: Additional names (common names):', additionalNames);
      console.log('DEBUG: All potential names (combined):', allPotentialNames);

      // First, try normal matching - only check typos if no exact matches found
      console.log('Checking for exact matches first:', allPotentialNames);
      
      // Check for typos in names that might be misspelled (but not possessive forms)
      for (const name of allPotentialNames) {
        let cleanName = name.replace(/[?!.,'"`]/g, '');
        if (cleanName.endsWith("'s")) {
          cleanName = cleanName.slice(0, -2);
        }
        
        // Only check for typos if this specific name won't generate any normal matches
        // This prevents possessive forms like "max's" from being treated as typos
        const willHaveMatches = EMPLOYEE_DATABASE.employees.some(employee => {
          const employeeName = employee.name.toLowerCase();
          const searchName = cleanName.toLowerCase();
          const firstName = employeeName.split(' ')[0];
          const lastName = employeeName.split(' ')[1] || '';
          
          return employeeName.includes(searchName) ||
                 searchName.includes(firstName) ||
                 searchName.includes(lastName) ||
                 firstName.includes(searchName) ||
                 lastName.includes(searchName);
        });
        
        // Only check for typos if this name won't match anyone normally
        if (!willHaveMatches) {
          console.log(`DEBUG: "${cleanName}" won't match normally, checking for typos...`);
          const typoSuggestion = checkForTypoInName(cleanName);
          if (typoSuggestion) {
            console.log('Found typo suggestion for name:', cleanName, '→', typoSuggestion);
            return typoSuggestion;
          }
        } else {
          console.log(`DEBUG: "${cleanName}" will match normally, skipping typo check`);
        }
      }

      // Also try partial matches and common name variations
      allPotentialNames.forEach(name => {
        let cleanName = name.replace(/[?!.,'"`]/g, '');
        // Handle possessive forms - remove 's at the end
        if (cleanName.endsWith("'s")) {
          cleanName = cleanName.slice(0, -2);
        }
        console.log('DEBUG: Searching for name:', cleanName);
        EMPLOYEE_DATABASE.employees.forEach(employee => {
          const employeeName = employee.name.toLowerCase();
          const searchName = cleanName.toLowerCase();
          
          console.log(`DEBUG: Comparing "${searchName}" with employee "${employeeName}"`);

          // Check for exact match, partial match, or first/last name match
          const firstName = employeeName.split(' ')[0];
          const lastName = employeeName.split(' ')[1] || '';
          
          const matches = employeeName.includes(searchName) ||
                         searchName.includes(firstName) ||
                         searchName.includes(lastName) ||
                         firstName.includes(searchName) ||
                         lastName.includes(searchName);
          
          if (matches) {
            console.log('DEBUG: ✅ Found candidate:', employee.name);
            candidates.push({
              type: 'employee',
              data: employee,
              relevance: 'name_match'
            });
          } else {
            console.log('DEBUG: ❌ No match');
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

    // Remove duplicate candidates
    const uniqueCandidates = candidates.filter((candidate, index) => {
      return candidates.findIndex(c => c.data.id === candidate.data.id) === index;
    });
    console.log('Found', candidates.length, 'total candidates,', uniqueCandidates.length, 'unique candidates');
    console.log('Candidates:', uniqueCandidates.map(c => c.data.name));

    // Handle different response scenarios
    if (uniqueCandidates.length === 0) {
      console.log('No candidates found, checking for typos...');
      // Check for typos and fuzzy matching only if no direct matches found
      const typoSuggestion = checkForTypos(userMessage);
      if (typoSuggestion) {
        console.log('Found typo suggestion:', typoSuggestion);
        return typoSuggestion;
      }

      console.log('No typos found, returning fallback message');
      // Return fallback message if no candidates and no typos found
      return "I couldn't find any matching information. Try asking about specific employees or departments.";
    } else if (uniqueCandidates.length === 1) {
      console.log('Single candidate found, generating detailed response for:', uniqueCandidates[0].data?.name);
      // Single match - provide direct response
      return generateDetailedResponse(uniqueCandidates[0]);
    } else {
      console.log('Multiple candidates found, generating ambiguity response');
      // Multiple matches - show selection options
      const ambiguityResponse = generateAmbiguityResponse(uniqueCandidates);
      setLastDisambiguationContent(ambiguityResponse);
      return ambiguityResponse;
    }
    } catch (error) {
      console.error('Error in generateAIResponse:', error);
      return "I'm having trouble processing your request. Please try again.";
    }
  };

  // Generate detailed response for single match
  const generateDetailedResponse = (candidate) => {
    try {
      console.log('generateDetailedResponse called with candidate:', candidate);
      const employee = candidate.data;
      console.log('Employee data:', employee);
      
      // If it's a paycheck query, return detailed paycheck card
      const lastMessage = messages[messages.length - 1];
      console.log('Last message:', lastMessage?.content);
      if (lastMessage && lastMessage.content.toLowerCase().includes('paycheck')) {
        console.log('Generating paycheck response for:', employee.name);
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
    console.log('Generating default employee info response');
    return `**${employee.name}** information:\n\n` +
           `• **Department**: ${employee.department}\n` +
           `• **Role**: ${employee.role}\n` +
           `• **Salary**: $${employee.salary.toLocaleString()}\n` +
           `• **Latest Paycheck**: ${employee.lastPaycheck}\n` +
           `• **Manager**: ${employee.manager}\n\n` +
           `Would you like more details or information about someone else?`;
    } catch (error) {
      console.error('Error in generateDetailedResponse:', error);
      return "I'm having trouble generating the detailed response. Please try again.";
    }
  };

  // Generate response with ambiguity options
  const generateAmbiguityResponse = (candidates) => {
    return JSON.stringify({
      type: 'disambiguation',
      candidates: candidates,
      message: `There are multiple ${candidates[0]?.data?.name?.split(' ')[0] || 'matches'} at Rippling, which one are you referring to?`
    });
  };

  // Handle user selection from ambiguity response
  const handleCandidateSelection = (candidateIndex) => {
    // This would be called when user clicks/selects from the chat
    const aiResponse = generateDetailedResponse({ data: selectedCandidate });
    onSendMessage(aiResponse);
    setSelectedCandidate(null);
  };

  // Parse message content to render chips and interactive employee names
  const parseMessageContent = (content, isAIMessage = false) => {
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

      // Add the chip or interactive employee name
      const name = match[1];
      const type = match[2];
      
      if (isAIMessage && type === 'employee') {
        // For AI messages, render as interactive employee name with dotted underline
        const employee = EMPLOYEE_DATABASE.employees.find(emp => emp.name === name);
        parts.push(
          <EmployeeTooltip key={match.index} employee={employee} name={name} />
        );
      } else {
        // For user messages, render as chip
        parts.push(
          <span key={match.index} className={`object-chip object-chip-${type}`}>
            <span className="chip-icon">
              {getChipIcon(type)}
            </span>
            <span className="chip-text">{name}</span>
          </span>
        );
      }

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
    if (!lastMessage || !lastMessage.isUser) return;

    // Check if user is responding to a disambiguation with a number
    if (messages.length >= 2) {
      const previousMessage = messages[messages.length - 2];
      if (!previousMessage.isUser && previousMessage.content.includes('"type":"disambiguation"')) {
        const numberMatch = lastMessage.content.trim().match(/^(\d+)$/);
        if (numberMatch) {
          const selectedIndex = parseInt(numberMatch[1]) - 1; // Convert to 0-based index
          
          try {
            const disambiguationData = JSON.parse(previousMessage.content);
            if (disambiguationData.candidates && selectedIndex >= 0 && selectedIndex < disambiguationData.candidates.length) {
              handleAmbiguitySelection(selectedIndex, disambiguationData.candidates);
              return;
            }
          } catch (e) {
            console.error('Error parsing disambiguation data:', e);
          }
        }
      }
      
      // Check if user is responding "Yes" to a PTO submission request
      if (!previousMessage.isUser && previousMessage.content.includes('Should I submit this request to your manager') && 
          (lastMessage.content.toLowerCase().trim() === 'yes' || lastMessage.content.toLowerCase().trim() === 'y')) {
        const confirmationResponse = `Submitted. You can ask me about the approval status anytime, or <span class="hyperlink-style">Go to the PTO app</span>.`;
        setTimeout(() => {
          onSendMessage(confirmationResponse, false);
        }, 500);
        return;
      }
      
      // Check if user is responding "Yes" to a typo suggestion
      if (!previousMessage.isUser && previousMessage.content.includes('Are you referring to {{') && 
          (lastMessage.content.toLowerCase().trim() === 'yes' || lastMessage.content.toLowerCase().trim() === 'y')) {
        // Extract employee name from the suggestion
        const suggestionMatch = previousMessage.content.match(/\{\{([^:]+):employee\}\}/);
        if (suggestionMatch) {
          const employeeName = suggestionMatch[1];
          const employee = EMPLOYEE_DATABASE.employees.find(emp => emp.name === employeeName);
          if (employee) {
            const response = `Got it. Here is the latest paycheck for {{${employee.name}:employee}}.`;
            setTimeout(() => {
              onSendMessage(response, false);
              // Then show the actual paycheck
              setTimeout(() => {
                const paycheckResponse = generateDetailedResponse({ data: employee });
                onSendMessage(paycheckResponse, false, true, {
                  originalDisambiguationContent: previousMessage.content,
                  selectedCandidateIndex: 0,
                  allCandidates: [{ data: employee }]
                });
              }, 1000);
            }, 500);
            return;
          }
        }
      }
    }

    // Handle regular AI queries
    if (isAIQuery(lastMessage.content)) {
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
      // Use fixed timing that matches ThinkingComponent: 200ms start + (800ms * steps) + 500ms buffer
      const fixedThinkingTime = 200 + (thinkingSteps.length * 800) + 500;
      setTimeout(() => {
        try {
          console.log('About to generate AI response for:', lastMessage.content);
          const aiResponse = generateAIResponse(lastMessage.content);
          console.log('AI response generated successfully:', aiResponse?.substring(0, 100) + '...');
          onSendMessage(aiResponse, false); // AI response is not from user
        } catch (error) {
          console.error('Error generating AI response:', error);
          onSendMessage("I'm sorry, I encountered an error processing your request. Please try again.", false);
        }
      }, 500 + fixedThinkingTime); // Base delay + fixed thinking time
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
    <div className="chat-messages" ref={chatContainerRef}>
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
                    parseMessageContent(message.content, false)
                  ) : message.content.startsWith('{"type":"thinking"') ? (
                    <ErrorBoundary>
                      <ThinkingComponent content={message.content} />
                    </ErrorBoundary>
                  ) : (
                    <AIReplyContent
                      content={message.content}
                      isAIQuery={isAIQueryMessage}
                      onCandidateSelect={handleAmbiguitySelection}
                      parseMessageContent={parseMessageContent}
                      onSendMessage={onSendMessage}
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
      {/* Scroll target for auto-scroll */}
      <div ref={messagesEndRef} />
    </div>
  );
};

// Component to render AI replies with interactive options
const AIReplyContent = ({ content, isAIQuery, onCandidateSelect, parseMessageContent, onSendMessage }) => {
  // Check if content contains HTML (like paycheck cards)
  if (content.includes('<div class="paycheck-card">')) {
    return <div dangerouslySetInnerHTML={{ __html: content }} />;
  }

  // Check if content is JSON-based (PTO request, disambiguation, etc.)
  try {
    const parsedContent = JSON.parse(content);
    
    if (parsedContent.type === 'pto_request') {
      const handlePTOSubmit = (requestData) => {
        const confirmationMessage = `Should I submit this request to your manager Patricia Gonzalez for approval? You can add some additional notes, too.`;
        
        onCandidateSelect && onCandidateSelect(0, [{ 
          data: { response: confirmationMessage } 
        }]);
      };

      return <PTORequestComponent 
        ptoData={parsedContent.data} 
        onSubmitRequest={handlePTOSubmit}
        onSendMessage={onSendMessage}
      />;
    }
    
    if (parsedContent.type === 'disambiguation') {
      return <DisambiguationDropdownNew 
        disambiguationData={parsedContent}
        onSelect={onCandidateSelect}
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

  // Parse HTML content (for hyperlinks and other HTML elements)
  const parseHTMLContent = (text) => {
    // Check if content contains HTML span elements
    if (text.includes('<span class="hyperlink-style">')) {
      return <div dangerouslySetInnerHTML={{ __html: text }} />;
    }
    // Otherwise, parse as bold text
    return parseBoldText(text);
  };

  if (isAIQuery) {
    // For AI query responses, parse and make interactive
    return <div className="ai-reply-content">{parseAIContent(content)}</div>;
  } else {
    // For regular AI responses, parse for employee names and HTML/bold text
    const parsedContent = parseMessageContent(content, true);
    if (typeof parsedContent === 'string') {
      return <div className="ai-reply-content">{parseHTMLContent(parsedContent)}</div>;
    }
    return <div className="ai-reply-content">{parsedContent}</div>;
  }
};

export default ChatMessages;
