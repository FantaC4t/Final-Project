import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

// Update the function signature to accept isLoggedIn
function Navigation({ openLogin, openSignup, isLoggedIn, handleLogout: parentHandleLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Check if user is logged in on component mount and when localStorage changes
  useEffect(() => {
    const checkUserLogin = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          // Handle invalid JSON
          console.error('Invalid user data in localStorage');
          localStorage.removeItem('user');
        }
      } else {
        setUser(null);
      }
    };
    
    // Check on mount
    checkUserLogin();
    
    // Add event listener for storage changes (in case user logs in/out in another tab)
    window.addEventListener('storage', checkUserLogin);
    
    return () => {
      window.removeEventListener('storage', checkUserLogin);
    };
  }, []);
  
  // Update toggleMenu function to prevent background scrolling
  const toggleMenu = () => {
    const newMenuState = !menuOpen;
    setMenuOpen(newMenuState);
    
    // Toggle body class to prevent scrolling
    if (newMenuState) {
      document.body.classList.add('menu-open');
      document.body.style.top = `-${window.scrollY}px`; // Remember scroll position
    } else {
      const scrollY = document.body.style.top;
      document.body.classList.remove('menu-open');
      document.body.style.top = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1); // Restore scroll position
    }
    
    // Close user menu if open
    if (userMenuOpen) {
      setUserMenuOpen(false);
    }
  };

  // Add cleanup function
  useEffect(() => {
    return () => {
      document.body.classList.remove('menu-open');
      document.body.style.top = '';
    };
  }, []);
  
  const toggleUserMenu = (e) => {
    e.preventDefault();
    setUserMenuOpen(!userMenuOpen);
  };
  
  // Updated handleLogout to call the parent's handleLogout as well
  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Update local state
    setUser(null);
    setUserMenuOpen(false);
    
    // Call parent's logout handler if provided
    if (parentHandleLogout) {
      parentHandleLogout();
    }
    
    // Redirect to home page
    navigate('/');
  };
  
  // Close menu when route changes
  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
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
          
          {/* Mobile-only user profile or login/signup */}
          {user ? (
            <li className="mobile-only user-profile-mobile">
              <div className="mobile-user-info">
                <div className="user-greeting">Welcome, {user.name}</div>
                <Link to="/account" className="pyro-button secondary full-width">
                  My Account
                </Link>
                <button onClick={handleLogout} className="pyro-button outline full-width">
                  Logout
                </button>
              </div>
            </li>
          ) : (
            <>
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
            </>
          )}
        </ul>
        
        {/* Desktop-only buttons or user menu */}
        {user ? (
          <div className="nav-actions desktop-only user-profile-desktop">
            <div className="user-menu-container">
              <button onClick={toggleUserMenu} className="user-menu-button">
                <span className="user-name">{user.name}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points={userMenuOpen ? "18 15 12 9 6 15" : "6 9 12 15 18 9"}></polyline>
                </svg>
              </button>
              
              {userMenuOpen && (
                <div className="user-dropdown">
                  <div className="user-dropdown-header">
                    <div className="user-name-full">{user.name}</div>
                    <div className="user-email">{user.email}</div>
                  </div>
                  <div className="user-dropdown-divider"></div>
                  <Link to="/account" className="user-dropdown-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    My Account
                  </Link>
                  <Link to="/orders" className="user-dropdown-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                      <line x1="3" y1="6" x2="21" y2="6"></line>
                      <path d="M16 10a4 4 0 0 1-8 0"></path>
                    </svg>
                    Orders
                  </Link>
                  <Link to="/wishlist" className="user-dropdown-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                    Wishlist
                  </Link>
                  <div className="user-dropdown-divider"></div>
                  <button onClick={handleLogout} className="user-dropdown-item logout">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="nav-actions desktop-only">
            <button onClick={openLogin} className="pyro-button secondary">
              Login
            </button>
            <button onClick={openSignup} className="pyro-button primary">
              Sign Up
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navigation;