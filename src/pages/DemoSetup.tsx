import { useState } from 'react';
import './DemoSetup.css';

interface DemoSetupData {
  userName: string;
  userEmail: string;
  timestamp: number;
}

interface DemoSetupProps {
  onNavigate?: (page: 'demo-setup' | 'onboarding' | 'recipe1' | 'recipe-loader' | 'recipe2') => void;
}

const DemoSetup: React.FC<DemoSetupProps> = ({ onNavigate }) => {
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLaunchDemo();
    }
  };

  const handleLaunchDemo = async () => {
    // Validate inputs
    if (!userName.trim() || !userEmail.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail.trim())) {
      alert('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    const demoData: DemoSetupData = {
      userName: userName.trim(),
      userEmail: userEmail.trim(),
      timestamp: Date.now()
    };

    // Save to localStorage for session persistence
    localStorage.setItem('demoSetupData', JSON.stringify(demoData));

    // Save to sessionStorage as backup
    sessionStorage.setItem('demoSetupData', JSON.stringify(demoData));

    console.log('Demo setup saved:', demoData);

    // Navigate to Onboarding page
    onNavigate?.('onboarding');

    setIsLoading(false);
  };

  return (
    <div className="demo-setup">
      <div className="demo-setup-container">
        <div className="demo-setup-content">
          {/* Header Section */}
          <div className="demo-setup-header">
            <h1 className="demo-setup-title">Setup Your Demo</h1>
            <p className="demo-setup-subtitle">
              Provide us with the details required to make the demo slap 👋
            </p>
          </div>

          {/* Form Section */}
          <div className="demo-setup-form">
            {/* User First Name Field */}
            <div className="form-field">
              <div className="field-label-container">
                <label className="field-label">First Name</label>
              </div>
              <div className="field-input-container">
                <div className="field-input-wrapper">
                  <input
                    type="text"
                    className="field-input"
                    placeholder="Enter your first name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                </div>
              </div>
            </div>

            {/* User Email Field */}
            <div className="form-field">
              <div className="field-label-container">
                <label className="field-label">Email</label>
              </div>
              <div className="field-input-container">
                <div className="field-input-wrapper">
                  <input
                    type="email"
                    className="field-input"
                    placeholder="Enter your email address"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Launch Demo Button */}
          <div className="demo-setup-actions">
            <button
              className="save-button"
              onClick={handleLaunchDemo}
              disabled={isLoading}
            >
              <span className="save-button-text">
                {isLoading ? 'Launching...' : 'Launch Demo'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoSetup;