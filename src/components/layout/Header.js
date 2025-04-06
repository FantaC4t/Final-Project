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

// Make sure to remove the class when component unmounts
useEffect(() => {
  return () => {
    document.body.classList.remove('menu-open');
  };
}, []);