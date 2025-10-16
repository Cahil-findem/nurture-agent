import React from 'react';
import './InteractionContract.css';

interface ContractCard {
  id: string;
  icon: string;
  title: string;
  description: React.ReactNode;
}

const InteractionContract: React.FC = () => {
  const contractCards: ContractCard[] = [
    {
      id: 'personal',
      icon: 'auto_awesome',
      title: 'Personal',
      description: (
        <>
          Recognize career milestones and work anniversaries to create authentic, <strong>personal connections</strong>.
        </>
      )
    },
    {
      id: 'audience',
      icon: 'sports_score',
      title: 'Audience',
      description: (
        <>
          Nurture your <strong>entire talent network</strong> to grow a long-term candidate pipeline.
        </>
      )
    },
    {
      id: 'cadence',
      icon: 'email',
      title: 'Cadance',
      description: (
        <>
          Reach out at least every <strong>3 months</strong> with content from your blog and new openings in your ATS.
        </>
      )
    },
    {
      id: 'updates',
      icon: 'schedule',
      title: 'Updates',
      description: (
        <>
          Get a <strong>weekly progress report every Monday</strong> with response rates and engagement highlights.
        </>
      )
    },
    {
      id: 'control',
      icon: 'handshake',
      title: 'Control',
      description: (
        <>
          Respect your <strong>no-contact list</strong> and confirm changes with you before updating the approach.
        </>
      )
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
