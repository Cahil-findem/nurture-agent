import React from 'react';
import './InteractionContract.css';

interface ContractCard {
  id: string;
  icon: string;
  title: string;
  description: string;
}

const InteractionContract: React.FC = () => {
  const contractCards: ContractCard[] = [
    {
      id: 'personal',
      icon: 'star',
      title: 'Personal',
      description: 'Recognize career milestones and work anniversaries to create authentic, personal connections.'
    },
    {
      id: 'audience',
      icon: 'group',
      title: 'Audience',
      description: 'Nurture your entire talent network to grow a long-term candidate pipeline.'
    },
    {
      id: 'cadence',
      icon: 'schedule',
      title: 'Cadence',
      description: 'Reach out at least every 3 months with content from your blog and new openings in your ATS.'
    },
    {
      id: 'updates',
      icon: 'analytics',
      title: 'Updates',
      description: 'Get a weekly progress report every Monday with response rates and engagement highlights.'
    },
    {
      id: 'control',
      icon: 'shield',
      title: 'Control',
      description: 'Respect your no-contact list and confirm changes with you before updating the approach.'
    }
  ];

  return (
    <div className="interaction-contract">
      {contractCards.map((card) => (
        <div key={card.id} className="contract-card">
          <div className="card-icon-wrapper">
            <span className="material-icons-round card-icon">{card.icon}</span>
          </div>
          <div className="card-content">
            <h3 className="card-title">{card.title}</h3>
            <p className="card-description">{card.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InteractionContract;