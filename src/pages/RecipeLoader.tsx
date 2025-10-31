import { useState, useEffect, useRef } from 'react';
import './RecipeLoader.css';
import { getCurrentBackend, getBackendConfig } from '../utils/backendConfig';

interface RecipeLoaderProps {
  onNavigate?: (page: 'demo-setup' | 'recipe1' | 'recipe-loader' | 'recipe2' | 'outreach-contract') => void;
}

interface LoadingCard {
  id: number;
  icon: string;
  title: string;
  text: string;
  visible: boolean;
  isImageCard?: boolean;
}

interface ImageState {
  image1: boolean;
  image2: boolean;
  image3: boolean;
  image4: boolean;
  image5: boolean;
}

const RecipeLoader: React.FC<RecipeLoaderProps> = ({ onNavigate }) => {
  const backend = getCurrentBackend();
  const config = getBackendConfig(backend);

  // Clear any old email data when component mounts to force fresh fetch
  useEffect(() => {
    console.log('='.repeat(80));
    console.log(`RecipeLoader - Initializing with backend: ${backend}`);
    console.log(`RecipeLoader - API URL: ${config.apiUrl}`);
    console.log(`RecipeLoader - Candidates:`, config.candidates);

    // Debug: Check what's in localStorage
    const storedData = localStorage.getItem('demoSetupData');
    console.log('RecipeLoader - demoSetupData from localStorage:', storedData);

    // Check if old email data exists
    const oldEmailData = localStorage.getItem('preGeneratedEmailData');
    if (oldEmailData) {
      console.log('RecipeLoader - REMOVING old email data:', oldEmailData.substring(0, 200) + '...');
    } else {
      console.log('RecipeLoader - No old email data to remove');
    }

    if (backend === 'natera') {
      alert(`✅ RecipeLoader loaded with NATERA backend!\n\nAPI: ${config.apiUrl}\nCandidate: ${config.candidates[0]?.name}\n\nWill fetch FRESH data...`);
    }

    localStorage.removeItem('preGeneratedEmailData');
    console.log('='.repeat(80));
  }, []);

  const [cards, setCards] = useState<LoadingCard[]>([
    {
      id: 1,
      icon: 'article',
      title: backend === 'kong' ? 'Gathering recent blog posts' : 'Gathering recent news articles',
      text: config.branding.website,
      visible: false,
      isImageCard: true
    },
    {
      id: 2,
      icon: 'draw',
      title: 'Crafting personalized content',
      text: '',
      visible: false
    },
    {
      id: 3,
      icon: 'event',
      title: 'Reviewing communication cadance',
      text: '',
      visible: false
    },
    {
      id: 4,
      icon: 'verified_user',
      title: 'Reviewing compliance standards',
      text: '',
      visible: false
    }
  ]);

  const [showContinue, setShowContinue] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [emailDataFetched, setEmailDataFetched] = useState(false);
  const [startTime] = useState(Date.now());
  const [fetchInProgress, setFetchInProgress] = useState(false);
  const fetchInitiated = useRef(false);
  const [imageStates, setImageStates] = useState<ImageState>({
    image1: false,
    image2: false,
    image3: false,
    image4: false,
    image5: false
  });

  // Function to fetch email data from backend API for all candidates
  const fetchEmailData = async () => {
    if (emailDataFetched || fetchInProgress || fetchInitiated.current) return; // Prevent duplicate calls

    fetchInitiated.current = true;
    setFetchInProgress(true);

    try {
      console.log(`RecipeLoader - Fetching email data from ${backend} API for all candidates...`);

      // Use dynamic candidates from backend config
      const candidates = config.candidates;

      // Fetch email data for all candidates in parallel
      const emailPromises = candidates.map(async (candidate, index) => {
        console.log(`RecipeLoader - Making API call for ${candidate.name} with candidate_id: ${candidate.id}`);

        // Different API formats for different backends
        const requestBody = backend === 'natera'
          ? candidate.fullProfile || {} // Natera expects full profile (includes ref and candidate)
          : { candidate_id: candidate.id }; // Kong expects just the ID

        console.log(`RecipeLoader - Request body for ${backend}:`, requestBody);

        const response = await fetch(config.apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        });
        console.log(`RecipeLoader - API call completed for ${candidate.name}`);

        if (response.ok) {
          const emailResponse = await response.json();
          console.log(`RecipeLoader - Email data fetched for ${candidate.name}:`, emailResponse);
          return {
            role: `candidate${index}`,
            candidateId: candidate.id,
            emailResponse: emailResponse
          };
        } else {
          console.error(`RecipeLoader - Failed to fetch email data for ${candidate.name} (${candidate.id})`);
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

      // Use the first candidate as the primary candidate for backward compatibility
      const primaryResult = results.find(r => r && r.role === 'candidate0');
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

        // Show images sequentially for the first card (left to right)
        if (index === 0) {
          // Show images one by one from left to right
          setTimeout(() => setImageStates(prev => ({ ...prev, image1: true })), 300);  // Left image
          setTimeout(() => setImageStates(prev => ({ ...prev, image3: true })), 800);  // Center image
          setTimeout(() => setImageStates(prev => ({ ...prev, image2: true })), 1300); // Right image
        }

        // Fetch email data when "Crafting your dynamic campaign content" card appears (index 1)
        if (index === 1) {
          fetchEmailData();
        }
      }, index * 1800); // Stagger each card by 1.8 seconds
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
    }, (cards.length * 1800) + 2000);

    // Cleanup timer on unmount
    return () => clearTimeout(showContinueTimer);
  }, []);

  // Watch for email data fetch completion
  useEffect(() => {
    if (emailDataFetched && !showContinue) {
      // Small delay to ensure all cards are visible before showing continue
      const minDisplayTime = cards.length * 1800;
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
    onNavigate?.('outreach-contract');
  };

  const handleRestartDemo = () => {
    // Navigate back to DemoSetup page
    onNavigate?.('demo-setup');
  };

  return (
    <div className="recipe-loader">
      {/* Progress Bar */}
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: '90%' }}></div>
      </div>

      <div className="recipe-loader-container">
        {/* Header with Logo */}
        <div className="title-section">
          <div className="title-with-logo">
            <img
              className="x-logo"
              src="/AI%20Loader.gif"
              alt="Logo"
            />
            <h1 className="page-title">
              {isComplete ? 'All done, hit continue when you are ready' : 'Great - hang tight while I pull together your campaign preview'}
            </h1>
          </div>
        </div>

        {/* Loading Cards */}
        <div className="loading-cards">
          {cards.map((card) => (
            <div
              key={card.id}
              className={`loading-card ${card.visible ? 'visible' : ''}`}
            >
              {card.isImageCard ? (
                <div className="image-card-icon">
                  <div className={`stacked-image image-back-left ${imageStates.image1 ? 'visible' : ''}`}>
                    <img src="/Left.png" alt="" />
                  </div>
                  <div className={`stacked-image image-back-right ${imageStates.image2 ? 'visible' : ''}`}>
                    <img src="/Right.png" alt="" />
                  </div>
                  <div className={`stacked-image image-center ${imageStates.image3 ? 'visible' : ''}`}>
                    <img src="/Center.png" alt="" />
                  </div>
                </div>
              ) : (
                <div className="card-icon">
                  <span className="material-icons-round">
                    {card.icon}
                  </span>
                </div>
              )}
              <div className="card-content">
                <h3 className="card-title">{card.title}</h3>
                {card.text && <p className="card-text">{card.text}</p>}
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