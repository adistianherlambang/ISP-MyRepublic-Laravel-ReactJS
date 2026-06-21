import React, { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import AdminDashboard from './pages/AdminDashboard';

// Define the backend API base URL
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

function App() {
  const [currentView, setCurrentView] = useState('landing');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#admin') {
        setCurrentView('admin');
      } else {
        setCurrentView('landing');
      }
    };

    // Check hash on mount
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <div className="app-container">
      {currentView === 'admin' ? (
        <AdminDashboard />
      ) : (
        <LandingPage />
      )}
    </div>
  );
}

export default App;
