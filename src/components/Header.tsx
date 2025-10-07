import './Header.css';

interface HeaderProps {
  onRestart?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onRestart }) => {
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-title">
          <div className="title-text">Nurture Agent</div>
        </div>
        <div className="header-actions">
          <button
            className="action-button restart-button"
            onClick={onRestart}
            title="Restart Demo"
          >
            <span className="material-icons-round">refresh</span>
          </button>
          <button className="action-button help-button">
            <span className="material-icons-round">help_outline</span>
          </button>
          <button className="action-button more-button">
            <span className="material-icons-round">more_vert</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;