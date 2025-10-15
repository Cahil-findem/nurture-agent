import { useState } from 'react';
import './GoalSelection.css';

interface GoalSelectionProps {
  onNavigate?: (page: 'demo-setup' | 'onboarding' | 'onboarding-step2' | 'goal-selection' | 'segments' | 'recipe1' | 'recipe-loader' | 'recipe2') => void;
  navigationDirection?: 'forward' | 'backward';
}

const GoalSelection: React.FC<GoalSelectionProps> = ({ onNavigate, navigationDirection = 'forward' }) => {
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<'forward' | 'backward'>('forward');

  const goals = [
    { id: 'applicants', text: 'Get more applicants' },
    { id: 'warm', text: 'Keep candidates warm' },
    { id: 'both', text: 'Both' },
  ];

  const handleGoalSelect = (goalId: string) => {
    // Allow deselection by clicking the same card
    const newSelectedGoal = selectedGoal === goalId ? null : goalId;
    setSelectedGoal(newSelectedGoal);

    // Store selection in localStorage
    const storedData = localStorage.getItem('demoSetupData');
    if (storedData) {
      try {
        const demoData = JSON.parse(storedData);
        demoData.selectedGoal = newSelectedGoal;
        localStorage.setItem('demoSetupData', JSON.stringify(demoData));
      } catch (error) {
        console.error('Error updating demo setup data:', error);
      }
    }
  };

  const handleContinue = () => {
    if (selectedGoal) {
      setTransitionDirection('forward');
      setIsTransitioning(true);
      setTimeout(() => {
        onNavigate?.('segments');
      }, 600);
    }
  };

  const handleBack = () => {
    setTransitionDirection('backward');
    setIsTransitioning(true);
    setTimeout(() => {
      onNavigate?.('onboarding-step2');
    }, 600);
  };

  return (
    <div className="goal-selection-container">
      {/* Progress Bar */}
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: '60%' }}></div>
      </div>

      {/* Main Content */}
      <div className="goal-selection-content">
        <div className="content-inner">
          <div className={`title-section ${isTransitioning ? (transitionDirection === 'forward' ? 'animate-fade-out-up' : 'animate-fade-out-down') : (navigationDirection === 'backward' ? 'animate-fade-in-down' : 'animate-fade-up')}`}>
            <div className="title-with-logo">
              <img
                className="x-logo"
                src="/AI Loader.gif"
                alt="Logo"
              />
              <h1 className="page-title">
                What's your main goal?
              </h1>
            </div>
          </div>

          <div className={`goals-grid ${isTransitioning ? (transitionDirection === 'forward' ? 'animate-fade-out-up' : 'animate-fade-out-down') : (navigationDirection === 'backward' ? 'animate-fade-in-down animate-delay-1' : 'animate-fade-up animate-delay-1')}`}>
            {goals.map((goal, index) => {
              const isSelected = selectedGoal === goal.id;
              const isUnselected = selectedGoal && !isSelected;

              return (
                <div
                  key={goal.id}
                  className={`goal-card ${isSelected ? 'selected' : ''} ${isUnselected ? 'unselected' : ''} ${isTransitioning ? (transitionDirection === 'forward' ? 'animate-fade-out-up' : 'animate-fade-out-down') : (navigationDirection === 'backward' ? 'animate-fade-in-down' : 'animate-fade-up')}`}
                  style={{ animationDelay: `${0.2 + index * 0.1}s` }}
                  onClick={() => handleGoalSelect(goal.id)}
                >
                <div className="goal-card-text">
                  {goal.text}
                </div>
                {isSelected && (
                  <div className="goal-card-icon">
                    check_circle
                  </div>
                )}
                </div>
              );
            })}
          </div>

          <div className={`buttons-container ${isTransitioning ? (transitionDirection === 'forward' ? 'animate-fade-out-up' : 'animate-fade-out-down') : (navigationDirection === 'backward' ? 'animate-fade-in-down animate-delay-2' : 'animate-fade-up animate-delay-2')}`}>
            <div className="button-wrapper">
              <div
                className="btn btn-secondary"
                onClick={handleBack}
              >
                Back
              </div>
            </div>

            <div className="button-wrapper">
              <div
                className={`btn btn-blue ${!selectedGoal ? 'disabled' : ''}`}
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

export default GoalSelection;