import { useState, useEffect } from 'react';
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

  useEffect(() => {
    const showCard = (index: number) => {
      setTimeout(() => {
        setCards(prev => prev.map((card, i) =>
          i === index ? { ...card, visible: true } : card
        ));
      }, index * 1000); // Stagger each card by 1 second
    };

    // Show each card with a delay
    cards.forEach((_, index) => {
      showCard(index);
    });

    // Show continue button 4 seconds after the last card appears
    setTimeout(() => {
      setShowContinue(true);
      setIsComplete(true);
    }, (cards.length * 1000) + 4000);
  }, []);

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