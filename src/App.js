import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/pages/Home';
import Navigation from './components/Navigation';
import AuthModal from './components/AuthModal';
import Compare from './components/pages/Compare';
import Builder from './components/pages/Builder';
import Deals from './components/pages/Deals';
import About from './components/pages/About';
import Footer from './components/Footer';
import './styles/main.css';

function App() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');

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
  };

  return (
    <Router>
      <div className="pyro-container">
        <AuthModal 
          isOpen={authModalOpen} 
          onClose={closeAuthModal} 
          initialTab={authModalTab}
        />
        
        {/* Navigation in App level to be available on all pages */}
        <div className="pyro-header">
          <Navigation openLogin={openLoginModal} openSignup={openSignupModal} />
        </div>
        
        <Routes>
          <Route path="/" element={<Home openLogin={openLoginModal} openSignup={openSignupModal} />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/builder" element={<Builder />} />
          <Route path="/deals" element={<Deals />} />
          <Route path="/about" element={<About />} />
        </Routes>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;