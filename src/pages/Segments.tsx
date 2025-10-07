import { useState } from 'react';
import './Segments.css';

interface SegmentsProps {
  onNavigate?: (page: 'demo-setup' | 'onboarding' | 'onboarding-step2' | 'goal-selection' | 'segments' | 'recipe1' | 'recipe-loader' | 'recipe2', direction?: 'forward' | 'backward') => void;
  navigationDirection?: 'forward' | 'backward';
}

const Segments: React.FC<SegmentsProps> = ({ onNavigate, navigationDirection = 'forward' }) => {
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<'forward' | 'backward'>('forward');

  const segments = [
    { id: 'current-employees', text: 'Current employees' },
    { id: 'recent-applicants', text: 'Recent applicants' },
    { id: 'competitors', text: 'Competitors' },
    { id: 'silver-medalists', text: 'Silver medalists' },
    { id: 'other', text: 'Other' },
  ];

  const handleSegmentToggle = (segmentId: string) => {
    setSelectedSegments(prev => {
      if (prev.includes(segmentId)) {
        return prev.filter(id => id !== segmentId);
      } else {
        return [...prev, segmentId];
      }
    });

    // Store selection in localStorage
    const storedData = localStorage.getItem('demoSetupData');
    if (storedData) {
      try {
        const demoData = JSON.parse(storedData);
        const newSelectedSegments = selectedSegments.includes(segmentId)
          ? selectedSegments.filter(id => id !== segmentId)
          : [...selectedSegments, segmentId];
        demoData.selectedSegments = newSelectedSegments;
        localStorage.setItem('demoSetupData', JSON.stringify(demoData));
      } catch (error) {
        console.error('Error updating demo setup data:', error);
      }
    }
  };

  const handleContinue = () => {
    setTransitionDirection('forward');
    setIsTransitioning(true);
    setTimeout(() => {
      onNavigate?.('recipe-loader', 'forward');
    }, 600);
  };

  const handleBack = () => {
    setTransitionDirection('backward');
    setIsTransitioning(true);
    setTimeout(() => {
      onNavigate?.('goal-selection', 'backward');
    }, 600);
  };

  return (
    <div className="segments-container">
      {/* Progress Bar */}
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: '80%' }}></div>
      </div>

      {/* Main Content */}
      <div className="segments-content">
        <div className="content-inner">
          <div className={`title-section ${isTransitioning ? (transitionDirection === 'forward' ? 'animate-fade-out-up' : 'animate-fade-out-down') : (navigationDirection === 'backward' ? 'animate-fade-in-down' : 'animate-fade-up')}`}>
            <div className="title-with-logo">
              <img
                className="x-logo"
                src="/AI Loader.gif"
                alt="Logo"
              />
              <h1 className="page-title">
                Before we kick this off, is there anyone we shouldn't contact?
              </h1>
            </div>
            <p className="subtitle">Select all that apply:</p>
          </div>

          <div className={`segments-grid ${isTransitioning ? (transitionDirection === 'forward' ? 'animate-fade-out-up' : 'animate-fade-out-down') : (navigationDirection === 'backward' ? 'animate-fade-in-down animate-delay-1' : 'animate-fade-up animate-delay-1')}`}>
            {segments.map((segment, index) => {
              const isSelected = selectedSegments.includes(segment.id);

              return (
                <div
                  key={segment.id}
                  className={`segment-card ${isSelected ? 'selected' : ''} ${isTransitioning ? (transitionDirection === 'forward' ? 'animate-fade-out-up' : 'animate-fade-out-down') : (navigationDirection === 'backward' ? 'animate-fade-in-down' : 'animate-fade-up')}`}
                  style={{ animationDelay: `${0.2 + index * 0.1}s` }}
                  onClick={() => handleSegmentToggle(segment.id)}
                >
                  <div className="segment-card-text">
                    {segment.text}
                  </div>
                  <div className={`segment-card-checkbox ${isSelected ? 'checked' : ''}`}>
                    {isSelected && (
                      <div className="segment-card-icon">
                        check
                      </div>
                    )}
                  </div>
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
                className="btn btn-dark"
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

export default Segments;