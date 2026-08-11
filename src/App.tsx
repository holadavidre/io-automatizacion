import { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';

export function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard'>('landing');

  return (
    <div className="w-full min-h-screen bg-[#080c14]">
      {currentView === 'landing' ? (
        <LandingPage onOpenDashboard={() => setCurrentView('dashboard')} />
      ) : (
        <Dashboard onBackToHome={() => setCurrentView('landing')} />
      )}
    </div>
  );
}

export default App;
