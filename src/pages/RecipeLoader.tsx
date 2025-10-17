import { useState, useEffect, useRef } from 'react';
import './RecipeLoader.css';

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
  const [cards, setCards] = useState<LoadingCard[]>([
    {
      id: 1,
      icon: 'article',
      title: 'Gathering recent blog posts',
      text: 'www.kong.com/blog',
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

  // Function to fetch email data from Kong API for all three candidates
  const fetchEmailData = async () => {
    if (emailDataFetched || fetchInProgress || fetchInitiated.current) return; // Prevent duplicate calls
    
    fetchInitiated.current = true;
    setFetchInProgress(true);
    
    try {
      console.log('RecipeLoader - Fetching email data from Kong API for all candidates...');
      
      const candidateIds = {
        jacobWang: 'pub_hola_5c7d24bb19976ca87e8f8bbb',
        kristinaWong: 'pub_5d984bc378b4d04f623a7b2f',
        colinFarnan: 'pub_5c7baa020cadfda94cb36a7f'
      };

      const roles = [
        { key: 'jacobWang', name: 'Jacob Wang - Senior Software Engineer' },
        { key: 'kristinaWong', name: 'Kristina Wong - Senior Product Designer' },
        { key: 'colinFarnan', name: 'Colin Farnan - Account Executive' }
      ];

      // Fetch email data for all candidates in parallel
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

      // Use the first candidate (jacobWang) as the primary candidate for backward compatibility
      const primaryResult = results.find(r => r && r.role === 'jacobWang');
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