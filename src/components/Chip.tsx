import './Chip.css';

interface ChipProps {
  label: string;
  onRemove?: () => void;
  removable?: boolean;
}

const Chip: React.FC<ChipProps> = ({
  label,
  onRemove,
  removable = true
}) => {
  return (
    <div className="chip">
      <span className="chip-label">{label}</span>
      {removable && (
        <button
          className="chip-remove-button"
          onClick={onRemove}
          aria-label={`Remove ${label}`}
        >
          <span className="material-icons-round chip-remove-icon">
            close
          </span>
        </button>
      )}
    </div>
  );
};

export default Chip;