import { useState, useEffect } from 'react';
import './Onboarding.css';

interface DemoSetupData {
  userName: string;
  userEmail: string;
  companyName: string;
  companyWebsite: string;
  crawledData?: any;
  timestamp: number;
}

interface OnboardingProps {
  onNavigate?: (page: 'demo-setup' | 'onboarding' | 'onboarding-step2' | 'goal-selection' | 'segments' | 'recipe1' | 'recipe-loader' | 'recipe2' | 'outreach-contract', direction?: 'forward' | 'backward') => void;
  initialStep?: number;
  navigationDirection?: 'forward' | 'backward';
}

const Onboarding: React.FC<OnboardingProps> = ({ onNavigate, initialStep = 1, navigationDirection = 'forward' }) => {
  const [userName, setUserName] = useState('');
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<'forward' | 'backward'>('forward');

  useEffect(() => {
    // Get user data from localStorage to personalize greeting
    const storedData = localStorage.getItem('demoSetupData');
    if (storedData) {
      try {
        const demoData: DemoSetupData = JSON.parse(storedData);
        setUserName(demoData.userName || 'there');
      } catch (error) {
        console.error('Error parsing demo setup data:', error);
        setUserName('there');
      }
    } else {
      setUserName('there');
    }

    // Set initial step
    setCurrentStep(initialStep);
  }, [initialStep]);

  const handleContinue = () => {
    if (currentStep === 1) {
      // Transition to step 2
      setTransitionDirection('forward');
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(2);
        setIsTransitioning(false);
      }, 600); // Wait for fade-out animation
    } else if (currentStep === 2) {
      // Transition to step 3
      setTransitionDirection('forward');
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(3);
        setIsTransitioning(false);
      }, 600); // Wait for fade-out animation
    } else {
      // Go to goal selection page
      onNavigate?.('goal-selection', 'forward');
    }
  };

  const handleBack = () => {
    if (currentStep === 2) {
      // Transition back to step 1
      setTransitionDirection('backward');
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(1);
        setIsTransitioning(false);
      }, 600); // Wait for fade-out animation
    } else if (currentStep === 3) {
      // Transition back to step 2
      setTransitionDirection('backward');
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(2);
        setIsTransitioning(false);
      }, 600); // Wait for fade-out animation
    }
  };

  const getStepContent = () => {
    if (currentStep === 1) {
      return {
        greeting: `Hey ${userName} 👋`,
        message: "I'm Cleo, and I'll be helping you build personal<br>relationships with your talent. Let's get started!"
      };
    } else if (currentStep === 2) {
      return {
        greeting: "Think of me as part of your team.",
        message: "I'll automatically nurture your talent based on their achievements, career updates, and interests."
      };
    } else {
      return {
        greeting: "I nurture your talent around the clock.",
        message: "Anytime you want to adjust our approach or hit pause, just let me know."
      };
    }
  };

  const stepContent = getStepContent();

  const getAnimationClass = (baseDelay = '') => {
    if (isTransitioning) {
      return transitionDirection === 'forward' ? 'animate-fade-out-up' : 'animate-fade-out-down';
    } else {
      return navigationDirection === 'backward' ? `animate-fade-in-down ${baseDelay}` : `animate-fade-up ${baseDelay}`;
    }
  };

  return (
    <div className="onboarding-container">
      {/* Progress Bar */}
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: currentStep === 1 ? '20%' : currentStep === 2 ? '40%' : '60%' }}></div>
      </div>

      {/* Main Content */}
      <div className="onboarding-content">
        <div className="content-inner">
          <img
            className={`logo ${getAnimationClass()}`}
            src="/AI Loader.gif"
            alt="Loading animation"
          />

          <div className={`greeting-section ${getAnimationClass('animate-delay-1')}`}>
            <div className="greeting-header">
              <div className="greeting-title">
                {stepContent.greeting}
              </div>
            </div>
            <div className="greeting-body">
              <div className="welcome-message-container">
                <div className="welcome-message" dangerouslySetInnerHTML={{ __html: stepContent.message }} />
              </div>
            </div>
          </div>

          <div className={`buttons-container ${getAnimationClass('animate-delay-2')}`}>
            {(currentStep === 2 || currentStep === 3) && (
              <div className="button-wrapper">
                <div
                  className="btn btn-secondary"
                  onClick={handleBack}
                >
                  Back
                </div>
              </div>
            )}

            <div className="button-wrapper">
              <div
                className="btn btn-blue"
                data-dark-mode="False"
                data-has-icon-end="false"
                data-has-icon-start="false"
                data-has-logo-start="false"
                data-show-label="true"
                data-size="Medium"
                data-state="Idle"
                data-style="Primary - Blue"
                data-variant="Text Only"
                data-version-2-0="False"
                onClick={handleContinue}
              >
                Continue
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;