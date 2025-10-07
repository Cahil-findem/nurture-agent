import { ReactNode } from 'react';
import './FormField.css';

interface FormFieldProps {
  label: string;
  description?: string;
  children: ReactNode;
  required?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  description,
  children,
  required = false
}) => {
  return (
    <div className="form-field-enhanced">
      <div className="form-field-label-section">
        <label className="form-field-label">
          {label}
          {required && <span className="form-field-required">*</span>}
        </label>
        {description && (
          <p className="form-field-description">{description}</p>
        )}
      </div>
      <div className="form-field-input-section">
        {children}
      </div>
    </div>
  );
};

export default FormField;