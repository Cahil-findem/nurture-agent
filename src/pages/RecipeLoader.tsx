import { useState, useEffect, useRef } from 'react';
import './RecipeLoader.css';

interface RecipeLoaderProps {
  onNavigate?: (page: 'demo-setup' | 'recipe1' | 'recipe-loader' | 'recipe2' | 'recipe2_2') => void;
}

interface LoadingCard {
  id: number;
  icon: string;
  title: string;
  text: string;
  visible: boolean;
}

const RecipeLoader: React.FC<RecipeLoaderProps> = ({ onNavigate }) => {
  const [cards, setCards] = useState<LoadingCard[]>([
    {
      id: 1,
      icon: 'search',
      title: 'Scanning your company\'s content sources',
      text: 'Selecting the most relevant, high-performing, and up-to-date content.',
      visible: false
    },
    {
      id: 2,
      icon: 'draw',
      title: 'Crafting your dynamic campaign content',
      text: "We're tailoring content to match your brand voice and approved messaging.",
      visible: false
    },
    {
      id: 3,
      icon: 'schedule',
      title: 'Applying communication restrictions',
      text: 'We will not contact candidates more than twice every 30 days.',
      visible: false
    },
    {
      id: 4,
      icon: 'verified_user',
      title: 'Reviewing compliance requirements',
      text: 'All campaigns align with GDPR, EEO, and unsubscribe requirements.',
      visible: false
    }
  ]);

  const [showContinue, setShowContinue] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [emailDataFetched, setEmailDataFetched] = useState(false);
  const [startTime] = useState(Date.now());
  const [fetchInProgress, setFetchInProgress] = useState(false);
  const fetchInitiated = useRef(false);

  // Function to fetch email data from Kong API for all three candidates
  const fetchEmailData = async () => {
    if (emailDataFetched || fetchInProgress || fetchInitiated.current) return; // Prevent duplicate calls
    
    // Check if data already exists
    const existingData = localStorage.getItem('preGeneratedEmailData');
    if (existingData) {
      console.log('RecipeLoader - Email data already exists, skipping fetch');
      setEmailDataFetched(true);
      return;
    }
    
    fetchInitiated.current = true;
    setFetchInProgress(true);
    
    try {
      console.log('RecipeLoader - Fetching email data from Kong API for all candidates...');
      
      const candidateIds = {
        commissionsAnalyst: '68d193fecb73815f93cc0e45',
        financialReportingManager: '68e3ff4a389a44ae4034feb4', 
        customerSuccessManager: '68d6bc9325d43c5a707e3d34'
      };

      const roles = [
        { key: 'commissionsAnalyst', name: 'Sr. Commissions Analyst' },
        { key: 'financialReportingManager', name: 'Financial Reporting Manager' },
        { key: 'customerSuccessManager', name: 'Customer Success Operations Manager' }
      ];

      // Fetch email data for all three candidates in parallel
      const emailPromises = roles.map(async (role) => {
        const candidateId = candidateIds[role.key as keyof typeof candidateIds];
        
        console.log(`RecipeLoader - Making API call for ${role.name} with candidate_id: ${candidateId}`);
        const response = await fetch('https://kong-email-creator.vercel.app/api/generate-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            candidate_id: candidateId
          })
        });
        console.log(`RecipeLoader - API call completed for ${role.name}`);

        if (response.ok) {
          const emailResponse = await response.json();
          console.log(`RecipeLoader - Email data fetched for ${role.name}:`, emailResponse);
          return {
            role: role.key,
            candidateId: candidateId,
            emailResponse: emailResponse
          };
        } else {
          console.error(`RecipeLoader - Failed to fetch email data for ${role.name} (${candidateId})`);
          return null;
        }
      });

      const results = await Promise.all(emailPromises);
      
      // Store all email responses in localStorage for EmailPreview to use
      const preGeneratedEmails = {
        candidates: {},
        roleEmails: {}  // Changed from emailData to avoid conflict
      } as any;

      results.forEach(result => {
        if (result) {
          preGeneratedEmails.candidates[result.role] = result.emailResponse.candidate;
          preGeneratedEmails.roleEmails[result.role] = result.emailResponse;
        }
      });

      // Use the first candidate (commissionsAnalyst) as the primary candidate for backward compatibility
      const primaryResult = results.find(r => r && r.role === 'commissionsAnalyst');
      if (primaryResult) {
        preGeneratedEmails.candidate = primaryResult.emailResponse.candidate;
        preGeneratedEmails.emailData = primaryResult.emailResponse; // Keep for backward compatibility
      }
        
      localStorage.setItem('preGeneratedEmailData', JSON.stringify(preGeneratedEmails));
      console.log('RecipeLoader - All email data stored in localStorage');
      setEmailDataFetched(true); // This will trigger the useEffect to show continue button
    } catch (error) {
      console.error('RecipeLoader - Error fetching email data:', error);
    } finally {
      setFetchInProgress(false);
    }
  };

  useEffect(() => {
    const showCard = (index: number) => {
      setTimeout(() => {
        setCards(prev => prev.map((card, i) =>
          i === index ? { ...card, visible: true } : card
        ));
        
        // Fetch email data when "Crafting your dynamic campaign content" card appears (index 1)
        if (index === 1) {
          fetchEmailData();
        }
      }, index * 1000); // Stagger each card by 1 second
    };

    // Show each card with a delay
    cards.forEach((_, index) => {
      showCard(index);
    });

    // Show continue button 2 seconds after the last card appears OR when email data is fetched
    const showContinueTimer = setTimeout(() => {
      // Only show continue if email data is fetched, otherwise wait for it
      if (emailDataFetched) {
        setShowContinue(true);
        setIsComplete(true);
      }
    }, (cards.length * 1000) + 2000);

    // Cleanup timer on unmount
    return () => clearTimeout(showContinueTimer);
  }, []);

  // Watch for email data fetch completion
  useEffect(() => {
    if (emailDataFetched && !showContinue) {
      // Small delay to ensure all cards are visible before showing continue
      const minDisplayTime = cards.length * 1000;
      const currentTime = Date.now();
      const elapsedTime = currentTime - startTime;
      
      if (elapsedTime >= minDisplayTime) {
        setShowContinue(true);
        setIsComplete(true);
      } else {
        setTimeout(() => {
          setShowContinue(true);
          setIsComplete(true);
        }, minDisplayTime - elapsedTime);
      }
    }
  }, [emailDataFetched, showContinue, startTime, cards.length]);

  const handleContinue = () => {
    onNavigate?.('recipe2_2');
  };

  const handleRestartDemo = () => {
    // Navigate back to DemoSetup page
    onNavigate?.('demo-setup');
  };

  return (
    <div className="recipe-loader">
      <div className="recipe-loader-container">
        {/* Loading Chip Header */}
        <div className="loading-chip">
          {isComplete ? (
            <div className="loading-complete">
              <span className="material-icons-round">check_circle</span>
            </div>
          ) : (
            <div className="loading-spinner"></div>
          )}
          <span className="loading-chip-text">
            {isComplete ? 'Content creation complete!' : 'Creating your nurture content...'}
          </span>
        </div>

        {/* Loading Cards */}
        <div className="loading-cards">
          {cards.map((card) => (
            <div
              key={card.id}
              className={`loading-card ${card.visible ? 'visible' : ''}`}
            >
              <div className={`card-icon ${isComplete ? 'completed' : ''}`}>
                <span className="material-icons-round">
                  {isComplete ? 'check' : card.icon}
                </span>
              </div>
              <div className="card-content">
                <h3 className="card-title">{card.title}</h3>
                <p className="card-text">{card.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Continue Button */}
        {showContinue && (
          <div className="recipe-loader-actions">
            <button
              className="continue-button"
              onClick={handleContinue}
            >
              <span className="continue-button-text">Continue</span>
            </button>
          </div>
        )}
      </div>

      {/* Restart Demo Button */}
      <button
        className="restart-demo-button"
        onClick={handleRestartDemo}
        title="Restart Demo"
      >
        <span className="material-icons-round">refresh</span>
        <span className="restart-text">Restart</span>
      </button>
    </div>
  );
};

export default RecipeLoader;