import './TextArea.css';

interface TextAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  className?: string;
}

const TextArea: React.FC<TextAreaProps> = ({
  value,
  onChange,
  placeholder = "",
  rows = 4,
  disabled = false,
  className = ""
}) => {
  return (
    <div className={`textarea-wrapper ${className}`}>
      <textarea
        className="textarea-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
      />
    </div>
  );
};

export default TextArea;