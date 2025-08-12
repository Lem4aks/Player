import { useState, useRef, useEffect } from 'react';
import classes from './styles.module.scss';
import { ArrowIcon } from '../../assets/svg';

interface Option {
  value: string;
  label: string;
}

interface Props {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const Select: React.FC<Props> = ({
  options,
  value,
  onChange,
  placeholder = "Select..."
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={classes.selectContainer} ref={selectRef}>
      <div 
        className={classes.selectTrigger}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedOption?.label || placeholder}</span>
        <div className={`${classes.arrow} ${isOpen ? classes.open : ''}`}>
          <ArrowIcon />
        </div>
      </div>
      
      {isOpen && (
        <div className={classes.selectOptions}>
          {options.map((option) => (
            <div
              key={option.value}
              className={`${classes.option} ${option.value === value ? classes.selected : ''}`}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Select;
