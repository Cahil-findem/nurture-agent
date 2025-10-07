import { useState } from 'react';
import Chip from './Chip';
import './ChipSelector.css';

interface ChipSelectorOption {
  value: string;
  label: string;
}

interface ChipSelectorProps {
  selectedValues: string[];
  onValuesChange: (values: string[]) => void;
  options: ChipSelectorOption[];
  placeholder?: string;
}

const ChipSelector: React.FC<ChipSelectorProps> = ({
  selectedValues,
  onValuesChange,
  options,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Filter out already selected options
  const availableOptions = options.filter(
    option => !selectedValues.includes(option.label)
  );

  const handleOptionSelect = (value: string) => {
    const selectedOption = options.find(option => option.value === value);
    if (selectedOption && !selectedValues.includes(selectedOption.label)) {
      onValuesChange([...selectedValues, selectedOption.label]);
    }
    setIsOpen(false);
  };

  const handleRemoveValue = (indexToRemove: number) => {
    const newValues = selectedValues.filter((_, index) => index !== indexToRemove);
    onValuesChange(newValues);
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    // Don't open dropdown if clicking on a chip's remove button
    if ((e.target as HTMLElement).closest('.chip-remove-button')) {
      return;
    }
    if (availableOptions.length > 0) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="chip-selector">
      <div
        className={`chip-selector-container ${isOpen ? 'chip-selector-open' : ''}`}
        onClick={handleContainerClick}
      >
        {/* Display existing chips */}
        <div className="selected-chips">
          {selectedValues.map((value, index) => (
            <Chip
              key={index}
              label={value}
              onRemove={() => handleRemoveValue(index)}
            />
          ))}
        </div>

        {/* Dropdown arrow */}
        {availableOptions.length > 0 && (
          <span className="material-icons-round chip-selector-arrow">
            {isOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
          </span>
        )}

        {/* Dropdown menu */}
        {isOpen && availableOptions.length > 0 && (
          <div className="chip-selector-dropdown">
            {availableOptions.map((option) => (
              <div
                key={option.value}
                className="chip-selector-option"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOptionSelect(option.value);
                }}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChipSelector;