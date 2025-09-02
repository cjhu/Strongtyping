import React, { useState, useEffect } from 'react';
import './StrongTypingDropdown.css';

// Mock data - comprehensive demo data for showcasing typeahead and navigation
const MOCK_DATA = {
  employees: [
    // A names
    { id: 1, name: 'Alice Anderson', displayName: 'Alice Anderson', type: 'employee' },
    { id: 2, name: 'Aaron Adams', displayName: 'Aaron Adams', type: 'employee' },
    { id: 3, name: 'Amanda Alvarez', displayName: 'Amanda Alvarez', type: 'employee' },
    { id: 4, name: 'Andrew Arnold', displayName: 'Andrew Arnold', type: 'employee' },
    { id: 5, name: 'Anna Avery', displayName: 'Anna Avery', type: 'employee' },

    // B names
    { id: 6, name: 'Benjamin Brooks', displayName: 'Benjamin Brooks', type: 'employee' },
    { id: 7, name: 'Barbara Bennett', displayName: 'Barbara Bennett', type: 'employee' },
    { id: 8, name: 'Brandon Bailey', displayName: 'Brandon Bailey', type: 'employee' },
    { id: 9, name: 'Bethany Bishop', displayName: 'Bethany Bishop', type: 'employee' },
    { id: 10, name: 'Brian Baker', displayName: 'Brian Baker', type: 'employee' },

    // C names
    { id: 11, name: 'Christopher Carter', displayName: 'Christopher Carter', type: 'employee' },
    { id: 12, name: 'Catherine Collins', displayName: 'Catherine Collins', type: 'employee' },
    { id: 13, name: 'Charles Cooper', displayName: 'Charles Cooper', type: 'employee' },
    { id: 14, name: 'Cynthia Cruz', displayName: 'Cynthia Cruz', type: 'employee' },
    { id: 15, name: 'Cameron Cook', displayName: 'Cameron Cook', type: 'employee' },

    // D names
    { id: 16, name: 'Daniel Davis', displayName: 'Daniel Davis', type: 'employee' },
    { id: 17, name: 'Diana Dixon', displayName: 'Diana Dixon', type: 'employee' },
    { id: 18, name: 'David Kim', displayName: 'David Kim', type: 'employee' },
    { id: 19, name: 'Donna Duncan', displayName: 'Donna Duncan', type: 'employee' },
    { id: 20, name: 'Derek Diaz', displayName: 'Derek Diaz', type: 'employee' },

    // E names
    { id: 21, name: 'Emily Evans', displayName: 'Emily Evans', type: 'employee' },
    { id: 22, name: 'Eric Edwards', displayName: 'Eric Edwards', type: 'employee' },
    { id: 23, name: 'Elizabeth Ellis', displayName: 'Elizabeth Ellis', type: 'employee' },
    { id: 24, name: 'Ethan Elliott', displayName: 'Ethan Elliott', type: 'employee' },
    { id: 25, name: 'Eva Estrada', displayName: 'Eva Estrada', type: 'employee' },

    // J names (for demo - many names starting with J)
    { id: 26, name: 'John Johnson', displayName: 'John Johnson', type: 'employee' },
    { id: 27, name: 'Jane Jackson', displayName: 'Jane Jackson', type: 'employee' },
    { id: 28, name: 'James Jordan', displayName: 'James Jordan', type: 'employee' },
    { id: 29, name: 'Jennifer Davis', displayName: 'Jennifer Davis', type: 'employee' },
    { id: 30, name: 'Joseph Jimenez', displayName: 'Joseph Jimenez', type: 'employee' },
    { id: 31, name: 'Jessica Jensen', displayName: 'Jessica Jensen', type: 'employee' },
    { id: 32, name: 'Jonathan Jacobs', displayName: 'Jonathan Jacobs', type: 'employee' },
    { id: 33, name: 'Julia Johnston', displayName: 'Julia Johnston', type: 'employee' },

    // M names (including our Max employees for demo)
    { id: 34, name: 'Max Frothingham', displayName: 'Max Frothingham', type: 'employee' },
    { id: 35, name: 'Max Jasso Jr.', displayName: 'Max Jasso Jr.', type: 'employee' },
    { id: 36, name: 'Max Levchin', displayName: 'Max Levchin', type: 'employee' },
    { id: 37, name: 'Max Wesel', displayName: 'Max Wesel', type: 'employee' },
    { id: 38, name: 'Michael Roberts', displayName: 'Michael Roberts', type: 'employee' },
    { id: 39, name: 'Maria Martinez', displayName: 'Maria Martinez', type: 'employee' },

    // S names (including our key employees for demo)
    { id: 40, name: 'Sarah Johnson', displayName: 'Sarah Johnson', type: 'employee' },
    { id: 41, name: 'Steven Sanchez', displayName: 'Steven Sanchez', type: 'employee' },
    { id: 42, name: 'Stephanie Scott', displayName: 'Stephanie Scott', type: 'employee' },
    { id: 43, name: 'Samuel Sanders', displayName: 'Samuel Sanders', type: 'employee' },
    { id: 44, name: 'Samantha Simmons', displayName: 'Samantha Simmons', type: 'employee' },

    // Additional diverse names
    { id: 45, name: 'Robert Rodriguez', displayName: 'Robert Rodriguez', type: 'employee' },
    { id: 46, name: 'Rachel Ramirez', displayName: 'Rachel Ramirez', type: 'employee' },
    { id: 47, name: 'William Williams', displayName: 'William Williams', type: 'employee' },
    { id: 48, name: 'Olivia Oliver', displayName: 'Olivia Oliver', type: 'employee' },
    { id: 49, name: 'Kevin Kim', displayName: 'Kevin Kim', type: 'employee' },
    { id: 50, name: 'Lisa Liu', displayName: 'Lisa Liu', type: 'employee' }
  ],
  departments: [
    { id: 1, name: 'Engineering', displayName: 'Engineering', type: 'department' },
    { id: 2, name: 'Product', displayName: 'Product', type: 'department' },
    { id: 3, name: 'Design', displayName: 'Design', type: 'department' },
    { id: 4, name: 'Marketing', displayName: 'Marketing', type: 'department' },
    { id: 5, name: 'Sales', displayName: 'Sales', type: 'department' },
    { id: 6, name: 'Customer Success', displayName: 'Customer Success', type: 'department' },
    { id: 7, name: 'Human Resources', displayName: 'Human Resources', type: 'department' },
    { id: 8, name: 'Finance', displayName: 'Finance', type: 'department' },
    { id: 9, name: 'Operations', displayName: 'Operations', type: 'department' },
    { id: 10, name: 'Legal', displayName: 'Legal', type: 'department' },
    { id: 11, name: 'IT', displayName: 'IT', type: 'department' },
    { id: 12, name: 'Research & Development', displayName: 'Research & Development', type: 'department' },
    { id: 13, name: 'Quality Assurance', displayName: 'Quality Assurance', type: 'department' },
    { id: 14, name: 'Business Development', displayName: 'Business Development', type: 'department' },
    { id: 15, name: 'Executive', displayName: 'Executive', type: 'department' }
  ],
  payruns: [
    // Monthly payrolls
    { id: 1, name: 'Monthly Payroll - January 2024', displayName: 'Monthly Payroll - January 2024', type: 'payrun' },
    { id: 2, name: 'Monthly Payroll - February 2024', displayName: 'Monthly Payroll - February 2024', type: 'payrun' },
    { id: 3, name: 'Monthly Payroll - March 2024', displayName: 'Monthly Payroll - March 2024', type: 'payrun' },
    { id: 4, name: 'Monthly Payroll - April 2024', displayName: 'Monthly Payroll - April 2024', type: 'payrun' },
    { id: 5, name: 'Monthly Payroll - May 2024', displayName: 'Monthly Payroll - May 2024', type: 'payrun' },
    { id: 6, name: 'Monthly Payroll - June 2024', displayName: 'Monthly Payroll - June 2024', type: 'payrun' },
    { id: 7, name: 'Monthly Payroll - July 2024', displayName: 'Monthly Payroll - July 2024', type: 'payrun' },
    { id: 8, name: 'Monthly Payroll - August 2024', displayName: 'Monthly Payroll - August 2024', type: 'payrun' },

    // Bonus runs
    { id: 9, name: 'Annual Bonus - Q1 2024', displayName: 'Annual Bonus - Q1 2024', type: 'payrun' },
    { id: 10, name: 'Performance Bonus - Q2 2024', displayName: 'Performance Bonus - Q2 2024', type: 'payrun' },
    { id: 11, name: 'Holiday Bonus - December 2023', displayName: 'Holiday Bonus - December 2023', type: 'payrun' },
    { id: 12, name: 'Retention Bonus - March 2024', displayName: 'Retention Bonus - March 2024', type: 'payrun' },

    // Special runs
    { id: 13, name: 'Off-Cycle Adjustment - April 2024', displayName: 'Off-Cycle Adjustment - April 2024', type: 'payrun' },
    { id: 14, name: 'Commission Payout - Q1 2024', displayName: 'Commission Payout - Q1 2024', type: 'payrun' },
    { id: 15, name: 'Stock Grant Exercise - February 2024', displayName: 'Stock Grant Exercise - February 2024', type: 'payrun' },
    { id: 16, name: 'Severance Package - May 2024', displayName: 'Severance Package - May 2024', type: 'payrun' },
    { id: 17, name: 'Contractor Payment - Weekly', displayName: 'Contractor Payment - Weekly', type: 'payrun' }
  ]
};

const CATEGORIES = [
  { id: 'employees', name: 'Employees', icon: '👥' },
  { id: 'departments', name: 'Departments', icon: '🏢' },
  { id: 'payruns', name: 'Pay Runs', icon: '💰' }
];

const FREQUENTLY_USED = [
  { id: 26, name: 'John Johnson', displayName: 'John Johnson', type: 'employee' },
  { id: 1, name: 'Engineering', displayName: 'Engineering', type: 'department' },
  { id: 34, name: 'Michael Miller', displayName: 'Michael Miller', type: 'employee' },
  { id: 8, name: 'Finance', displayName: 'Finance', type: 'department' },
  { id: 6, name: 'Monthly Payroll - June 2024', displayName: 'Monthly Payroll - June 2024', type: 'payrun' }
];

const StrongTypingDropdown = ({ searchTerm, position, onObjectSelect, onCategorySelect }) => {
  const [activeCategory, setActiveCategory] = useState(null);
  const [filteredResults, setFilteredResults] = useState({});
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [allItems, setAllItems] = useState([]);

  useEffect(() => {
    if (activeCategory) {
      // Drill-down mode: show all items in the active category
      const categoryItems = MOCK_DATA[activeCategory] || [];
      setFilteredResults({
        [activeCategory]: categoryItems
      });
      setAllItems(categoryItems);
      setSelectedIndex(categoryItems.length > 0 ? 0 : -1); // Auto-select first item in drill-down mode
    } else if (searchTerm.trim() === '') {
      // Normal mode: show categories and frequently used
      setFilteredResults({
        categories: CATEGORIES,
        frequentlyUsed: FREQUENTLY_USED
      });
      setAllItems([...CATEGORIES, ...FREQUENTLY_USED]);
      setSelectedIndex(CATEGORIES.length + FREQUENTLY_USED.length > 0 ? 0 : -1); // Auto-select first item in normal mode
    } else {
      // Search mode: filter across all categories
      const results = {};
      const items = [];
      Object.entries(MOCK_DATA).forEach(([categoryKey, categoryItems]) => {
        const filtered = categoryItems
          .filter(item =>
            item.name.toLowerCase().startsWith(searchTerm.toLowerCase())
          )
          .slice(0, 5); // Show first 5 results per category

        if (filtered.length > 0) {
          results[categoryKey] = filtered;
          items.push(...filtered);
        }
      });
      setFilteredResults(results);
      setAllItems(items);
      setSelectedIndex(items.length > 0 ? 0 : -1); // Auto-select first item in search mode
    }
  }, [searchTerm, activeCategory]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (allItems.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev =>
            prev < allItems.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < allItems.length) {
            const selectedItem = allItems[selectedIndex];
            if (selectedItem.type) {
              // It's an object - select it
              onObjectSelect(selectedItem);
            } else {
              // It's a category - drill down
              handleCategoryClick(selectedItem);
            }
          }
          break;
        case 'Tab':
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < allItems.length) {
            const selectedItem = allItems[selectedIndex];
            if (!selectedItem.type) {
              // It's a category - drill down
              handleCategoryClick(selectedItem);
            }
          }
          break;
        case 'Backspace':
          e.preventDefault();
          if (activeCategory) {
            // Go back when in drill-down mode
            handleBack();
          }
          break;
        case 'Escape':
          // This should be handled by the parent component
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [allItems, selectedIndex, onObjectSelect, onCategorySelect]);

  const handleCategoryClick = (category) => {
    if (searchTerm.trim() === '') {
      // Drill down to category
      setActiveCategory(category.id);
      onCategorySelect(category);
    } else {
      // In search mode, clicking category drills down to filtered results
      setActiveCategory(category.id);
    }
  };

  const handleBack = () => {
    setActiveCategory(null);
    setSelectedIndex(-1);
    // Reset to normal mode (categories + frequently used)
    setFilteredResults({
      categories: CATEGORIES,
      frequentlyUsed: FREQUENTLY_USED
    });
    setAllItems([...CATEGORIES, ...FREQUENTLY_USED]);
  };

  const handleObjectClick = (object) => {
    onObjectSelect(object);
  };

  const getItemIndex = (item) => {
    return allItems.findIndex(i => {
      // For category items (from CATEGORIES array)
      if (!i.type) {
        return i.id === item.id;
      }
      // For object items (from MOCK_DATA or FREQUENTLY_USED)
      if (i.type) {
        return i.id === item.id && i.type === item.type;
      }
      return false;
    });
  };

  const renderCategorySection = (categoryKey, items) => {
    const category = CATEGORIES.find(cat => cat.id === categoryKey);
    const showAll = items.length >= 5 && searchTerm.trim() !== '';

    return (
      <div key={categoryKey} className="dropdown-section">
        <div
          className="dropdown-category-header"
          onClick={() => category && handleCategoryClick(category)}
        >
          <span className="category-icon">{category?.icon || '📁'}</span>
          <span className="category-name">{category?.name || categoryKey}</span>
          {showAll && <span className="show-more">+{items.length - 5} more</span>}
        </div>
        <div className="dropdown-items">
          {items.map(item => {
            const itemIndex = getItemIndex(item);
            return (
              <div
                key={item.id || Math.random()}
                className={`dropdown-item ${selectedIndex === itemIndex ? 'selected' : ''}`}
                onClick={() => handleObjectClick(item)}
              >
                <span className="item-name">{item.displayName || item.name || 'Unknown'}</span>
                <span className="item-type">{item.type || 'item'}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderCategories = () => (
    <div className="dropdown-categories">
      {CATEGORIES.map(category => {
        const categoryIndex = allItems.findIndex(item => item.id === category.id && !item.type);
        return (
          <div
            key={category.id}
            className={`dropdown-category ${selectedIndex === categoryIndex ? 'selected' : ''}`}
            onClick={() => handleCategoryClick(category)}
          >
            <span className="category-icon">{category.icon || '📁'}</span>
            <span className="category-name">{category.name || category.id}</span>
            <span className="tab-indicator" aria-label="Press Tab to drill down"></span>
          </div>
        );
      })}
    </div>
  );

  const renderFrequentlyUsed = () => (
    <div className="dropdown-section">
      <div className="dropdown-category-header">
        <span className="category-icon">⭐</span>
        <span className="category-name">Frequently Used</span>
      </div>
      <div className="dropdown-items">
        {FREQUENTLY_USED.map(item => {
          const itemIndex = getItemIndex(item);
          return (
            <div
              key={item.id || Math.random()}
              className={`dropdown-item ${selectedIndex === itemIndex ? 'selected' : ''}`}
              onClick={() => handleObjectClick(item)}
            >
              <span className="item-name">{item.displayName || item.name || 'Unknown'}</span>
              <span className="item-type">{item.type || 'item'}</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderSearchResults = () => (
    <div className="dropdown-search-results">
      {Object.entries(filteredResults).map(([categoryKey, items]) =>
        renderCategorySection(categoryKey, items)
      )}
    </div>
  );

  const renderHeader = () => {
    if (!activeCategory) return null;

    const category = CATEGORIES.find(cat => cat.id === activeCategory);
    if (!category) return null;

    return (
      <div className="dropdown-header">
        <button className="back-button" onClick={handleBack}>
          <span className="back-arrow">←</span>
          Back
        </button>
        <span>{category.icon} {category.name}</span>
      </div>
    );
  };

  const renderKeyboardShortcuts = () => (
    <div className="dropdown-footer">
      <div className="keyboard-shortcuts">
        <div className="shortcut">
          <span className="shortcut-key">↑↓</span>
          <span className="shortcut-desc">Navigate</span>
        </div>
        <div className="shortcut">
          <span className="shortcut-key">Enter</span>
          <span className="shortcut-desc">Select</span>
        </div>
        {activeCategory ? (
          <div className="shortcut">
            <span className="shortcut-key">⌫</span>
            <span className="shortcut-desc">Back</span>
          </div>
        ) : (
          <div className="shortcut">
            <span className="shortcut-key">Tab</span>
            <span className="shortcut-desc">Drill down</span>
            <span className="tab-hint">(→ arrows)</span>
          </div>
        )}
        <div className="shortcut">
          <span className="shortcut-key">Esc</span>
          <span className="shortcut-desc">Close</span>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={`strongtyping-dropdown ${position.positionAbove ? 'position-above' : 'position-below'}`}
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        zIndex: 1000
      }}
    >
      {renderHeader()}
      <div style={{ maxHeight: activeCategory ? '304px' : '352px', overflow: 'auto' }}>
        {activeCategory ? (
          // Show all items in the selected category
          renderCategorySection(activeCategory, MOCK_DATA[activeCategory] || [])
        ) : searchTerm.trim() === '' ? (
          <>
            {renderCategories()}
            {renderFrequentlyUsed()}
          </>
        ) : (
          renderSearchResults()
        )}
      </div>
      {renderKeyboardShortcuts()}
    </div>
  );
};

export default StrongTypingDropdown;
