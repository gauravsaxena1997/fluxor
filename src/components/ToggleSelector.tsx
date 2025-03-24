import './ToggleSelector.css';

interface ToggleSelectorProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  name?: string;
}

function ToggleSelector<T extends string>({ 
  options, 
  value, 
  onChange, 
  name 
}: ToggleSelectorProps<T>) {
  return (
    <div className="toggle-selector-group">
      {options.map(option => (
        <button 
          key={option.value}
          className={`toggle-selector-option ${value === option.value ? 'active' : ''}`}
          onClick={() => onChange(option.value)}
          type="button"
          aria-pressed={value === option.value}
          name={name}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export default ToggleSelector;
