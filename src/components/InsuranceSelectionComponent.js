import React, { useState } from 'react';
import './InsuranceSelectionComponent.css';

const InsuranceSelectionComponent = ({ insuranceData, message, onSelectInsurance }) => {
  const [selectedType, setSelectedType] = useState(null);

  const handleInsuranceSelect = (insuranceOption) => {
    setSelectedType(insuranceOption.type);
    
    // Generate detailed insurance information response
    const detailsMessage = generateInsuranceDetails(insuranceOption);
    
    // Send the detailed response as an AI message
    setTimeout(() => {
      onSelectInsurance && onSelectInsurance(detailsMessage, false);
    }, 500);
  };

  const generateInsuranceDetails = (insurance) => {
    return `Here's your **${insurance.type}** insurance coverage details:

**Plan:** ${insurance.plan}
**Premium:** ${insurance.premium} (${insurance.coverage})
**Deductible:** ${insurance.deductible}
**Network:** ${insurance.network}

**Coverage Details:**
${Object.entries(insurance.details).map(([key, value]) => 
  `• **${key.charAt(0).toUpperCase() + key.slice(1)}:** ${value}`
).join('\n')}

Your ${insurance.type.toLowerCase()} insurance is active and covers ${insurance.coverage.toLowerCase()}. You can make changes during open enrollment or if you have a qualifying life event.`;
  };

  return (
    <div className="insurance-selection-container">
      <div className="insurance-message">
        {message}
      </div>
      
      <div className="insurance-chips">
        {insuranceData.options.map((option) => (
          <button
            key={option.id}
            className={`insurance-chip ${selectedType === option.type ? 'selected' : ''}`}
            onClick={() => handleInsuranceSelect(option)}
            disabled={selectedType && selectedType !== option.type}
          >
            <div className="chip-icon">
              {option.type === 'Medical' ? '🏥' : 
               option.type === 'Dental' ? '🦷' : '👁️'}
            </div>
            <div className="chip-label">{option.type}</div>
          </button>
        ))}
      </div>
      
      {selectedType && (
        <div className="selection-feedback">
          Loading {selectedType.toLowerCase()} coverage details...
        </div>
      )}
    </div>
  );
};

export default InsuranceSelectionComponent;
