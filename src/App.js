import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/pages/Home';
import Navigation from './components/Navigation';
import AuthModal from './components/AuthModal';
import Compare from './components/pages/Compare';
import PCBuilder from './components/pages/PCBuilder'; // Changed from Builder to PCBuilder
import Deals from './components/pages/Deals';
import About from './components/pages/About';
import Footer from './components/layout/Footer'; // Update path to match your structure
import './styles/main.css';

function App() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);
  
  // Extract this to a separate function so it can be called after logout
  const checkAuthStatus = async () => {
    // Check for token in localStorage
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (res.ok) {
          setIsLoggedIn(true);
        } else {
          // Token invalid, remove it
          localStorage.removeItem('token');
          setIsLoggedIn(false);
        }
      } catch (err) {
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false);
    }
  };

  const handleLogout = () => {
    // Clear the token from localStorage
    localStorage.removeItem('token');
    
    // Update state to reflect logged out status
    setIsLoggedIn(false);
    
    // Optional: Redirect to home page
    window.location.href = '/';
  };

  const openLoginModal = () => {
    setAuthModalTab('login');
    setAuthModalOpen(true);
  };

  const openSignupModal = () => {
    setAuthModalTab('signup');
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
    // Check auth status after modal closes in case user just logged in
    checkAuthStatus();
  };

  return (
    <Router>
      <div className="pyro-container">
        <AuthModal 
          isOpen={authModalOpen} 
          onClose={closeAuthModal} 
          initialTab={authModalTab}
        />
        
        {/* Pass isLoggedIn and handleLogout to Navigation */}
        <div className="pyro-header">
          <Navigation 
            openLogin={openLoginModal} 
            openSignup={openSignupModal} 
            isLoggedIn={isLoggedIn}
            handleLogout={handleLogout}
          />
        </div>
        
        <Routes>
          <Route path="/" element={<Home 
            openLogin={openLoginModal} 
            openSignup={openSignupModal} 
            isLoggedIn={isLoggedIn} 
          />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/builder" element={<PCBuilder />} /> {/* Updated to use PCBuilder component */}
          <Route path="/deals" element={<Deals />} />
          <Route path="/about" element={<About />} />
        </Routes>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;