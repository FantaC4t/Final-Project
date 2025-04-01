import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navigation({ openLogin, openSignup }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  
  // Close menu when route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [location]);
  
  return (
    <nav>
      <div className="nav-container">
        {/* Logo */}
        <div className="pyro-logo">
          <Link to="/">
            <img src="/assets/EasyWare.png" alt="EasyWare Logo" />
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button 
          className="mobile-menu-toggle" 
          onClick={toggleMenu}
          aria-label="Toggle menu"
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
        
        {/* Nav links */}
        <ul className={`nav-links ${menuOpen ? 'active' : ''}`}>
          <li><Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link></li>
          <li><Link to="/compare" className={location.pathname === '/compare' ? 'active' : ''}>Compare</Link></li>
          <li><Link to="/builder" className={location.pathname === '/builder' ? 'active' : ''}>PC Builder</Link></li>
          <li><Link to="/deals" className={location.pathname === '/deals' ? 'active' : ''}>Deals</Link></li>
          <li><Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>About</Link></li>
          
          {/* Mobile-only links for login/signup */}
          <li className="mobile-only">
            <Link 
              to="/login" 
              className="pyro-button secondary full-width" 
              onClick={openLogin}
            >
              Login
            </Link>
          </li>
          <li className="mobile-only">
            <Link 
              to="/signup" 
              className="pyro-button primary full-width" 
              onClick={openSignup}
            >
              Sign Up
            </Link>
          </li>
        </ul>
        
        {/* Desktop-only buttons */}
        <div className="nav-actions desktop-only">
          <button onClick={openLogin} className="pyro-button secondary">
            Login
          </button>
          <button onClick={openSignup} className="pyro-button primary">
            Sign Up
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;