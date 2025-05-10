// Add this import at the top
import { FaBars, FaTimes } from 'react-icons/fa';

// Add this to your mobile menu toggle function:

const toggleMobileMenu = () => {
  setMobileMenuOpen(!mobileMenuOpen);
  
  // Toggle body class to prevent scrolling when menu is open
  if (!mobileMenuOpen) {
    document.body.classList.add('menu-open');
  } else {
    document.body.classList.remove('menu-open');
  }
};

// Update the header structure to ensure it's mobile-friendly
<header className={`pyro-header ${scrolled ? 'scrolled' : ''}`}>
  <div className="pyro-container header-container">
    <div className="header-left">
      <Link to="/" className="pyro-logo">
        {/* Your logo */}
        <span>PCBuilder</span>
      </Link>
    </div>
    
    <button 
      className="mobile-menu-button" 
      onClick={toggleMobileMenu}
      aria-label="Toggle navigation menu"
    >
      {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
    </button>
    
    <nav className={`nav-items ${isMobileMenuOpen ? 'active' : ''}`}>
      {/* Navigation items */}
    </nav>
    
    <div className="header-right">
      {/* Account links */}
    </div>
  </div>
</header>

// Make sure to remove the class when component unmounts
useEffect(() => {
  return () => {
    document.body.classList.remove('menu-open');
  };
}, []);