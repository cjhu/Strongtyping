import React, { useState, useRef, useEffect, useCallback } from 'react';
import StrongTypingDropdown from './StrongTypingDropdown';
import DisambiguationDropdown from './DisambiguationDropdown';
import AIResponseSelector from './AIResponseSelector';
import './ChatInput.css';

const ChatInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [showDisambiguation, setShowDisambiguation] = useState(false);
  const [disambiguationPosition, setDisambiguationPosition] = useState({ top: 0, left: 0 });
  const [detectedText, setDetectedText] = useState('');


  const inputRef = useRef(null);
  const disambiguationTimeoutRef = useRef(null);



  const handleInputChange = (e) => {
    const value = e.target.value;


    setMessage(value);

    // Check if @ was just typed
    if (value.endsWith('@')) {

      setShowDropdown(true);
      setShowDisambiguation(false);
      setDetectedText('');
      updateDropdownPosition();
    } else if (showDropdown) {

      // If dropdown is showing and user is typing after @, update search
      const atIndex = value.lastIndexOf('@');
      if (atIndex === -1) {
        // No @ found, hide dropdown

        setShowDropdown(false);
      }
      setShowDisambiguation(false);
      setDetectedText('');
    } else {


      // Analyze text for potential object references (debounced)
      analyzeTextForObjects(value);
    }
  };

  // Detect if the input looks like an AI query (questions about employees/payroll/etc)
  const detectAIQuery = (text) => {
    const lowerText = text.toLowerCase().trim();

    // Must be a question or query
    if (!lowerText.includes('?') &&
        !lowerText.startsWith('what') &&
        !lowerText.startsWith('who') &&
        !lowerText.startsWith('how') &&
        !lowerText.startsWith('when') &&
        !lowerText.startsWith('where') &&
        !lowerText.includes('tell me') &&
        !lowerText.includes('show me') &&
        !lowerText.includes('give me') &&
        !lowerText.includes('find') &&
        !lowerText.includes('get')) {
      return false;
    }

    // Look for employee/payroll related keywords
    const queryKeywords = [
      'paycheck', 'salary', 'payroll', 'employee', 'person',
      'department', 'team', 'manager', 'latest', 'last',
      'total', 'budget', 'headcount', 'role', 'position'
    ];

    const hasQueryKeyword = queryKeywords.some(keyword =>
      lowerText.includes(keyword)
    );

    if (!hasQueryKeyword) return false;

    // Look for potential names (capitalized words)
    const words = text.split(/\s+/);
    const capitalizedWords = words.filter(word =>
      word.length > 1 &&
      word[0] === word[0].toUpperCase() &&
      !['What', 'Who', 'How', 'When', 'Where', 'The', 'Is', 'Are', 'Do', 'Does'].includes(word)
    );

    // If we have query keywords OR potential names, consider it an AI query
    return hasQueryKeyword || capitalizedWords.length > 0;
  };

  // Analyze text for potential object references with debouncing
  const analyzeTextForObjects = useCallback((text) => {
    // Clear previous timeout
    if (disambiguationTimeoutRef.current) {
      clearTimeout(disambiguationTimeoutRef.current);
    }

    // Only analyze if text is not empty and doesn't contain @
    if (text.trim() && !text.includes('@')) {
      // Debounce the analysis to avoid interfering with typing
      disambiguationTimeoutRef.current = setTimeout(() => {
        // The performTextAnalysis function will handle the current state
        performTextAnalysis(text);
      }, 300); // Primary timeout

      // Also set a backup timeout in case the user stops typing completely
      setTimeout(() => {
        if (disambiguationTimeoutRef.current && message === text) {
          performTextAnalysis(text);
        }
      }, 1000); // Backup timeout after 1 second
    } else {
      setShowDisambiguation(false);
      setDetectedText('');
    }
  }, [message]); // Keep message dependency for proper state handling

  // Perform the actual text analysis
  const performTextAnalysis = (text) => {
    // Use the current message state instead of the potentially stale text parameter
    const currentText = message;
    const words = currentText.split(/\s+/);
    const allObjects = [
      // Include sample objects that match the AI chat system data
      { id: 5, name: 'Sarah Johnson', displayName: 'Sarah Johnson', type: 'employee' },
      { id: 6, name: 'Jennifer Davis', displayName: 'Jennifer Davis', type: 'employee' },
      { id: 7, name: 'Michael Roberts', displayName: 'Michael Roberts', type: 'employee' },
      { id: 8, name: 'David Kim', displayName: 'David Kim', type: 'employee' },
      { id: 9, name: 'Lisa Wong', displayName: 'Lisa Wong', type: 'employee' },
      { id: 10, name: 'Alex Turner', displayName: 'Alex Turner', type: 'employee' },
      { id: 1, name: 'Engineering', displayName: 'Engineering', type: 'department' },
      { id: 2, name: 'Marketing', displayName: 'Marketing', type: 'department' },
      { id: 3, name: 'Sales', displayName: 'Sales', type: 'department' },
      { id: 4, name: 'HR', displayName: 'HR', type: 'department' },
      { id: 5, name: 'Finance', displayName: 'Finance', type: 'department' },
      { id: 6, name: 'Monthly Payroll', displayName: 'Monthly Payroll - June 2024', type: 'payrun' },
      { id: 7, name: 'Annual Bonus', displayName: 'Annual Bonus - Q1 2024', type: 'payrun' }
    ];

    const detected = [];

    words.forEach((word, index) => {
      const cleanWord = word.replace(/[.,!?;:]$/, ''); // Remove punctuation

      // Skip common words that shouldn't trigger disambiguation
      const skipWords = ['who', 'what', 'where', 'when', 'how', 'why', 'is', 'are', 'was', 'were', 'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
      if (skipWords.includes(cleanWord.toLowerCase())) {
        return;
      }

      // Look for matches (partial matches for better detection)
      const matches = allObjects.filter(obj => {
        const objName = obj.name.toLowerCase();
        const searchWord = cleanWord.toLowerCase();

        const matches = objName.includes(searchWord) &&
                       cleanWord.length > 2 && // Only detect words longer than 2 chars
                       cleanWord.length < 20; // Avoid very long words

        return matches;
      });

      if (matches.length > 0) {
        detected.push({
          text: cleanWord,
          matches: matches.slice(0, 3), // Limit to top 3 matches
          wordIndex: index
        });
      }
    });

    // Show disambiguation for the first detected object
    if (detected.length > 0) {
      // Only update if we found something new or better
      const shouldUpdate = !showDisambiguation ||
                          !detectedText ||
                          detected[0].text !== detectedText;

      if (shouldUpdate) {
        setDetectedText(detected[0].text);
        setShowDisambiguation(true);
        updateDisambiguationPosition();
      }
    } else {
      // Only hide if there's no active detection
      if (!detectedText) {
        setShowDisambiguation(false);
      }
    }
  };



  const updateDropdownPosition = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      // Estimate dropdown dimensions
      const estimatedDropdownHeight = 400;
      const estimatedDropdownWidth = 360;
      const arrowHeight = 6; // Height of the arrow

      // Calculate ideal position (above the input)
      let top = rect.top - estimatedDropdownHeight - 8 - arrowHeight; // Space for arrow
      let left = rect.left;
      let positionAbove = true;

      // Check if dropdown would go above viewport
      if (top < 10) {
        // Position below input instead
        top = rect.bottom + 8;
        positionAbove = false;
      }

      // Check if dropdown would go off the right edge
      if (left + estimatedDropdownWidth > viewportWidth - 10) {
        left = viewportWidth - estimatedDropdownWidth - 10;
      }

      // Ensure left doesn't go negative
      left = Math.max(10, left);

      setDropdownPosition({
        top: top,
        left: left,
        positionAbove: positionAbove
      });
    }
  };

  // Update disambiguation dropdown position
  const updateDisambiguationPosition = () => {
    console.log('📍 Updating disambiguation position...');
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      console.log('📍 Input rect:', { top: rect.top, left: rect.left, right: rect.right, bottom: rect.bottom });
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      // Position disambiguation dropdown to the right of input
      let top = rect.top; // Align with input top
      let left = rect.right + 10; // To the right of input

      // If positioning to the right would go off-screen, try left side
      if (left + 320 > viewportWidth - 10) {
        left = rect.left - 330; // Position to the left
      }

      // If still off-screen on left, adjust
      if (left < 10) {
        left = 10;
      }

      // If dropdown would go below viewport, position above
      if (top + 300 > viewportHeight) {
        top = viewportHeight - 310; // Leave some margin
      }

      // Ensure positions are valid
      left = Math.max(10, left);
      top = Math.max(10, top);

      console.log('📍 Final disambiguation position:', { top, left });

      setDisambiguationPosition({
        top: top,
        left: left
      });
    } else {
      console.log('❌ Input ref not available, using fallback position');
      // Fallback position if input ref is not available
      setDisambiguationPosition({
        top: 200,
        left: 200
      });
    }
  };

  const handleKeyDown = (e) => {
    // If dropdown is active, don't handle Enter (let dropdown handle it)
    if ((showDropdown || showDisambiguation) && (e.key === 'Enter' || e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'Tab')) {
      return; // Let the dropdown handle these keys
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (message.trim()) {
        // Clear any pending disambiguation analysis
        if (disambiguationTimeoutRef.current) {
          clearTimeout(disambiguationTimeoutRef.current);
          disambiguationTimeoutRef.current = null;
        }

        onSendMessage(message);
        setMessage('');
        setShowDropdown(false);
        setShowDisambiguation(false);
        setDetectedText('');
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      setShowDisambiguation(false);
      setDetectedText('');
    }
  };

  const handleObjectInsert = useCallback((object) => {
    const atIndex = message.lastIndexOf('@');
    if (atIndex !== -1) {
      const beforeAt = message.substring(0, atIndex);
      const afterAt = message.substring(atIndex + 1);
      const spaceIndex = afterAt.indexOf(' ');
      const afterSearchTerm = spaceIndex !== -1 ? afterAt.substring(spaceIndex) : '';

      // Insert object as a chip-like format that can be styled
      const chipFormat = `{{${object.displayName}:${object.type}}}`;
      const newMessage = `${beforeAt}${chipFormat}${afterSearchTerm}`;
      setMessage(newMessage);
      setShowDropdown(false);

      // Focus back to input
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [message]);

  const handleCategorySelect = useCallback((category) => {
    // Handle category drill-down
    console.log('Category selected:', category);
  }, []);

  const handleDisambiguationSelect = useCallback((object) => {
    // Prevent double insertion
    if (!object || !detectedText || !message) return;

    // Replace the detected text with a chip format
    const chipFormat = `{{${object.displayName}:${object.type}}}`;
    const words = message.split(/\s+/);
    let replacementMade = false;

    const newWords = words.map(word => {
      const cleanWord = word.replace(/[.,!?;:]$/, '');
      if (!replacementMade && cleanWord.toLowerCase().includes(detectedText.toLowerCase())) {
        replacementMade = true;
        return word.replace(cleanWord, chipFormat);
      }
      return word;
    });

    const newMessage = newWords.join(' ');

    setMessage(newMessage);
    setShowDisambiguation(false);
    setDetectedText('');
  }, [message, detectedText]);

  const handleDisambiguationClose = useCallback(() => {
    setShowDisambiguation(false);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setShowDropdown(false);
        setShowDisambiguation(false);
        setDetectedText('');
        // Clear any pending disambiguation analysis
        if (disambiguationTimeoutRef.current) {
          clearTimeout(disambiguationTimeoutRef.current);
          disambiguationTimeoutRef.current = null;
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update position on window resize
  useEffect(() => {
    const handleResize = () => {
      if (showDropdown) {
        updateDropdownPosition();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [showDropdown]);

  // Cleanup effect for disambiguation timeout
  useEffect(() => {
    return () => {
      if (disambiguationTimeoutRef.current) {
        clearTimeout(disambiguationTimeoutRef.current);
      }
    };
  }, []);



  return (
    <div className="chat-input-container">
      <div className="chat-input-wrapper">
        <textarea
          ref={inputRef}
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type your message... Use @ to insert objects"
          className="chat-input"
          rows={1}
        />
        {showDropdown && (
          <StrongTypingDropdown
            searchTerm={message.substring(message.lastIndexOf('@') + 1)}
            position={dropdownPosition}
            onObjectSelect={handleObjectInsert}
            onCategorySelect={handleCategorySelect}
          />
        )}
        {showDisambiguation && (
          <DisambiguationDropdown
            detectedText={detectedText}
            position={disambiguationPosition}
            onObjectSelect={handleDisambiguationSelect}
            onClose={handleDisambiguationClose}
          />
        )}



      </div>
    </div>
  );
};

export default ChatInput;
