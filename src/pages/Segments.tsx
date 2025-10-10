import { useState, useEffect } from 'react';
import './Segments.css';

interface SegmentsProps {
  onNavigate?: (page: 'demo-setup' | 'onboarding' | 'onboarding-step2' | 'goal-selection' | 'segments' | 'recipe1' | 'recipe-loader' | 'recipe2', direction?: 'forward' | 'backward') => void;
  navigationDirection?: 'forward' | 'backward';
}

const Segments: React.FC<SegmentsProps> = ({ onNavigate, navigationDirection = 'forward' }) => {
  const [selectedSegments, setSelectedSegments] = useState<string[]>(['opt-out']); // Default opt-out selected
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<'forward' | 'backward'>('forward');
  const [showRejectionReasons, setShowRejectionReasons] = useState(false);
  const [selectedRejectionReasons, setSelectedRejectionReasons] = useState<string[]>([]);

  const segments = [
    { id: 'current-employees', text: 'Current employees' },
    { id: 'rejected-candidates', text: 'Candidates rejected for specific reasons', hasConfig: true },
    { id: 'blocked-candidates', text: 'Blocked candidates' },
    { id: 'opt-out', text: 'Candidates who opt out/unsubscribe', disabled: true },
  ];

  const rejectionReasons = [
    { id: 'poor-culture-fit', text: 'Poor culture fit' },
    { id: 'background-compliance', text: 'Background or Compliance issues' },
    { id: 'do-not-hire', text: 'Do not hire' },
  ];

  const handleSegmentToggle = (segmentId: string) => {
    // Prevent toggling the opt-out option (always selected)
    if (segmentId === 'opt-out') {
      return;
    }

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
        demoData.selectedRejectionReasons = selectedRejectionReasons;
        localStorage.setItem('demoSetupData', JSON.stringify(demoData));
      } catch (error) {
        console.error('Error updating demo setup data:', error);
      }
    }
  };

  const handleRejectionReasonToggle = (reasonId: string) => {
    setSelectedRejectionReasons(prev => {
      const newReasons = prev.includes(reasonId)
        ? prev.filter(id => id !== reasonId)
        : [...prev, reasonId];
      
      // Update localStorage
      const storedData = localStorage.getItem('demoSetupData');
      if (storedData) {
        try {
          const demoData = JSON.parse(storedData);
          demoData.selectedRejectionReasons = newReasons;
          localStorage.setItem('demoSetupData', JSON.stringify(demoData));
        } catch (error) {
          console.error('Error updating demo setup data:', error);
        }
      }
      
      return newReasons;
    });
  };

  const handleConfigClick = (segmentId: string) => {
    if (segmentId === 'rejected-candidates') {
      setShowRejectionReasons(!showRejectionReasons);
    }
  };

  // Load saved data on component mount
  useEffect(() => {
    const storedData = localStorage.getItem('demoSetupData');
    if (storedData) {
      try {
        const demoData = JSON.parse(storedData);
        if (demoData.selectedSegments) {
          // Ensure opt-out is always included
          const segments = demoData.selectedSegments.includes('opt-out') 
            ? demoData.selectedSegments 
            : [...demoData.selectedSegments, 'opt-out'];
          setSelectedSegments(segments);
        }
        if (demoData.selectedRejectionReasons) {
          setSelectedRejectionReasons(demoData.selectedRejectionReasons);
        }
      } catch (error) {
        console.error('Error loading demo setup data:', error);
      }
    }
  }, []);

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
              const isDisabled = segment.disabled;

              return (
                <div key={segment.id}>
                  <div
                    className={`segment-card ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''} ${isTransitioning ? (transitionDirection === 'forward' ? 'animate-fade-out-up' : 'animate-fade-out-down') : (navigationDirection === 'backward' ? 'animate-fade-in-down' : 'animate-fade-up')}`}
                    style={{ animationDelay: `${0.2 + index * 0.1}s` }}
                    onClick={() => handleSegmentToggle(segment.id)}
                  >
                    <div className="segment-card-text">
                      {segment.text}
                    </div>
                    <div className="segment-card-controls">
                      {segment.hasConfig && (
                        <button
                          className="config-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleConfigClick(segment.id);
                          }}
                          title="Configure rejection reasons"
                        >
                          <span className="material-icons-round">settings</span>
                        </button>
                      )}
                      <div className={`segment-card-checkbox ${isSelected ? 'checked' : ''} ${isDisabled ? 'disabled' : ''}`}>
                        {isSelected && (
                          <div className="segment-card-icon">
                            check
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Rejection Reasons Dropdown */}
                  {segment.id === 'rejected-candidates' && showRejectionReasons && (
                    <div className="rejection-reasons-dropdown">
                      <div className="rejection-reasons-header">
                        <span>Select rejection reasons to exclude:</span>
                      </div>
                      <div className="rejection-reasons-list">
                        {rejectionReasons.map((reason) => {
                          const isReasonSelected = selectedRejectionReasons.includes(reason.id);
                          return (
                            <div
                              key={reason.id}
                              className={`rejection-reason-item ${isReasonSelected ? 'selected' : ''}`}
                              onClick={() => handleRejectionReasonToggle(reason.id)}
                            >
                              <div className="rejection-reason-text">
                                {reason.text}
                              </div>
                              <div className={`rejection-reason-checkbox ${isReasonSelected ? 'checked' : ''}`}>
                                {isReasonSelected && (
                                  <div className="rejection-reason-icon">
                                    check
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
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