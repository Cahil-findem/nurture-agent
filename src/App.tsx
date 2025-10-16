import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DemoSetup from './pages/DemoSetup';
import Onboarding from './pages/Onboarding';
import GoalSelection from './pages/GoalSelection';
import Segments from './pages/Segments';
import Recipe1 from './pages/Recipe1';
import RecipeLoader from './pages/RecipeLoader';
import Recipe2 from './pages/Recipe2';
import Chat from './pages/Chat';
import OutreachContract from './pages/OutreachContract';
import './App.css';

type CurrentPage = 'demo-setup' | 'onboarding' | 'onboarding-step2' | 'goal-selection' | 'segments' | 'recipe1' | 'recipe-loader' | 'recipe2' | 'chat' | 'outreach-contract';

function App() {
  const [currentPage, setCurrentPage] = useState<CurrentPage>('demo-setup');
  const [navigationDirection, setNavigationDirection] = useState<'forward' | 'backward'>('forward');

  const navigateToPage = (page: CurrentPage, direction: 'forward' | 'backward' = 'forward') => {
    setNavigationDirection(direction);
    setCurrentPage(page);
  };

  const handleRestart = () => {
    // Clear all stored data
    localStorage.clear();
    sessionStorage.clear();

    // Navigate back to demo setup
    navigateToPage('demo-setup', 'backward');
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'demo-setup':
        return <DemoSetup onNavigate={navigateToPage} />;
      case 'onboarding':
        return <Onboarding onNavigate={navigateToPage} navigationDirection={navigationDirection} />;
      case 'onboarding-step2':
        return <Onboarding onNavigate={navigateToPage} initialStep={2} navigationDirection={navigationDirection} />;
      case 'goal-selection':
        return <GoalSelection onNavigate={navigateToPage} navigationDirection={navigationDirection} />;
      case 'segments':
        return <Segments onNavigate={navigateToPage} navigationDirection={navigationDirection} />;
      case 'recipe1':
        return <Recipe1 onNavigate={navigateToPage} />;
      case 'recipe-loader':
        return <RecipeLoader onNavigate={navigateToPage} />;
      case 'recipe2':
        return <Recipe2 onNavigate={navigateToPage} />;
      case 'chat':
        return <Chat onNavigate={navigateToPage} />;
      case 'outreach-contract':
        return <OutreachContract onNavigate={navigateToPage} />;
      default:
        return <DemoSetup onNavigate={navigateToPage} />;
    }
  };

  return (
    <div className="app">
      <Sidebar />
      <Header onRestart={handleRestart} />
      <div className="main-content">
        {renderCurrentPage()}
      </div>
    </div>
  );
}

export default App;