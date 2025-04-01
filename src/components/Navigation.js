import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navigation({ openLogin, openSignup }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  
  // Close menu when route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [location]);
  
  // Handle body scroll locking
  useEffect(() => {
    if (menuOpen) {
      document.body.classList.add('nav-open');
    } else {
      document.body.classList.remove('nav-open');
    }
    
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('nav-open');
    };
  }, [menuOpen]);
  
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  
  // Check if a link is active
  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav>
      <div className="pyro-logo">
        <Link to="/">
          <img src="/assets/EasyWare.png" alt="EasyWare Logo" />
        </Link>
      </div>
      
      <button 
        className="mobile-menu-toggle" 
        onClick={toggleMenu} 
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {menuOpen ? (
            <>
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </>
          ) : (
            <>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </>
          )}
        </svg>
      </button>
      
      <ul className={`nav-links ${menuOpen ? 'active' : ''}`}>
        <li><Link to="/" className={isActive('/')}>Home</Link></li>
        <li><Link to="/compare" className={isActive('/compare')}>Compare</Link></li>
        <li><Link to="/builder" className={isActive('/builder')}>PC Builder</Link></li>
        <li><Link to="/deals" className={isActive('/deals')}>Deals</Link></li>
        <li><Link to="/about" className={isActive('/about')}>About</Link></li>
        
        {/* Show these buttons only in mobile menu */}
        <li className="mobile-only">
          <div className="mobile-auth-buttons">
            <button onClick={() => { openLogin(); setMenuOpen(false); }} className="pyro-button secondary full-width">
              Login
            </button>
            <button onClick={() => { openSignup(); setMenuOpen(false); }} className="pyro-button primary full-width">
              Sign Up
            </button>
          </div>
        </li>
      </ul>
      
      <div className="nav-actions desktop-only">
        <button onClick={openLogin} className="pyro-button secondary">
          Login
        </button>
        <button onClick={openSignup} className="pyro-button primary">
          Sign Up
        </button>
      </div>
    </nav>
  );
}

export default Navigation;