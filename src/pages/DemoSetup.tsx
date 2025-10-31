import { useState } from 'react';
import './DemoSetup.css';
import { DemoSetupData } from '../types/demoData';

interface DemoSetupProps {
  onNavigate?: (page: 'demo-setup' | 'onboarding' | 'recipe1' | 'recipe-loader' | 'recipe2') => void;
}

const DemoSetup: React.FC<DemoSetupProps> = ({ onNavigate }) => {
  const [userName, setUserName] = useState('Gemma');
  const [userEmail, setUserEmail] = useState('gemma@gmail.com');
  const [backend, setBackend] = useState<'kong' | 'natera'>('kong');
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
      backend: backend,
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

            {/* Backend Selection */}
            <div className="form-field">
              <div className="field-label-container">
                <label className="field-label">Backend</label>
              </div>
              <div className="field-input-container">
                <div style={{ display: 'flex', gap: '20px', padding: '10px 0' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="backend"
                      value="kong"
                      checked={backend === 'kong'}
                      onChange={(e) => setBackend(e.target.value as 'kong' | 'natera')}
                      style={{ cursor: 'pointer' }}
                    />
                    <span style={{ color: '#E0E0E0', fontSize: '14px' }}>Kong</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="backend"
                      value="natera"
                      checked={backend === 'natera'}
                      onChange={(e) => setBackend(e.target.value as 'kong' | 'natera')}
                      style={{ cursor: 'pointer' }}
                    />
                    <span style={{ color: '#E0E0E0', fontSize: '14px' }}>Natera</span>
                  </label>
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