// Desc: Home page component
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function Home({ openLogin, openSignup }) {
  const [hovered, setHovered] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Scroll to features section
  const scrollToFeatures = () => {
    const featuresSection = document.querySelector('.pyro-categories');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const categories = [
    { id: 'gpu', name: 'Graphics Cards', icon: 'hardware/gpu.png', color: '#ff5e5e' },
    { id: 'cpu', name: 'Processors', icon: 'hardware/cpu.png', color: '#5e9fff' },
    { id: 'motherboard', name: 'Motherboards', icon: 'hardware/ram.webp', color: '#5effb8' },
    { id: 'peripherals', name: 'Peripherals', icon: 'hardware/keeb.webp', color: '#ff5ee7' }
  ];

  const useCases = [
    { id: 'gaming', name: 'Gaming', icon: '🎮', description: 'Optimized for high FPS and ray tracing' },
    { id: 'productivity', name: 'Productivity', icon: '💼', description: 'Multitasking and professional applications' },
    { id: 'content', name: 'Content Creation', icon: '🎬', description: 'Video editing and 3D rendering' },
    { id: 'budget', name: 'Budget', icon: '💰', description: 'Best performance per dollar' }
  ];

  return (
    <div className="pyro-container">
      
      {/* Hero Section */}
      <section className="pyro-hero">
        <div className="pyro-hero-content">
          <div className="pyro-hero-text">
            <h1 className="pyro-title">
              Find The Best <span className="text-gradient">Hardware Deals</span> Across Retailers
            </h1>
            <p className="pyro-subtitle">
              EasyWare helps you compare prices, find deals, and build your perfect PC setup with real-time pricing from top retailers.
            </p>
            
            <div className="pyro-stats">
              <div className="pyro-stat">
                <span className="stat-number">15+</span>
                <span className="stat-label">Retailers</span>
              </div>
              <div className="pyro-stat">
                <span className="stat-number">10k+</span>
                <span className="stat-label">Products</span>
              </div>
              <div className="pyro-stat">
                <span className="stat-number">500k+</span>
                <span className="stat-label">Price Comparisons</span>
              </div>
            </div>
            
            <div className="pyro-cta-buttons">
              <Link to="/compare" className="pyro-button primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                  <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
                Compare Prices
              </Link>
              <Link to="/builder" className="pyro-button secondary">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="9" y1="21" x2="9" y2="9"></line>
                </svg>
                PC Builder
              </Link>
            </div>
          </div>
          
          <div className="pyro-hero-visual">
            <div className="logo-container">
              <div className="dark-splash"></div>
              <div className="hardware-crown">
                <img src="/assets/hardware/cpu.png" className="hardware-item" alt="CPU" 
                     style={{"--final-x": "0px", "--final-y": "-120px", "--rotation": "0deg", "--delay": "0.1s"}} />
                <img src="/assets/hardware/gpu.png" className="hardware-item" alt="GPU" 
                     style={{"--final-x": "100px", "--final-y": "-60px", "--rotation": "-10deg", "--delay": "0.3s"}} />
                <img src="/assets/hardware/ram.webp" className="hardware-item" alt="RAM" 
                     style={{"--final-x": "100px", "--final-y": "60px", "--rotation": "-15deg", "--delay": "0.5s"}} />
                <img src="/assets/hardware/motherboard.png" className="hardware-item" alt="Motherboard" 
                     style={{"--final-x": "0px", "--final-y": "120px", "--rotation": "0deg", "--delay": "0.7s"}} />
              </div>
              <img src="/assets/EasyWare.png" alt="EasyWare Logo" className="pyro-logo" />
              <div className="dark-ripple"></div>
            </div>
          </div>
        </div>
        
        <div className="pyro-scroll-indicator" onClick={scrollToFeatures}>
          <span>Explore</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="7 13 12 18 17 13"></polyline>
            <polyline points="7 6 12 11 17 6"></polyline>
          </svg>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="pyro-how-it-works">
        <div className="section-header">
          <h2>How It Works</h2>
          <p>Simple steps to find the best deals on computer hardware</p>
        </div>
        
        <div className="steps-container">
          <div className="step-card">
            <div className="step-number">1</div>
            <div className="step-icon">💲</div>
            <h3>Set Your Budget</h3>
            <p>Define how much you want to spend and we'll find options within your price range</p>
          </div>
          
          <div className="step-card">
            <div className="step-number">2</div>
            <div className="step-icon">🎯</div>
            <h3>Choose Your Use Case</h3>
            <p>Tell us what you'll use your PC for, and we'll recommend optimized components</p>
          </div>
          
          <div className="step-card">
            <div className="step-number">3</div>
            <div className="step-icon">👍</div>
            <h3>Set Preferences</h3>
            <p>Select brands, performance factors, and features that matter to you</p>
          </div>
          
          <div className="step-card">
            <div className="step-number">4</div>
            <div className="step-icon">🔍</div>
            <h3>Compare Results</h3>
            <p>We'll scan across retailers to find the best deals matching your criteria</p>
          </div>
        </div>
      </section>
      
      {/* Use Cases Section */}
      <section className="pyro-use-cases">
        <div className="section-header">
          <h2>Shop By Use Case</h2>
          <p>Optimized recommendations for your specific needs</p>
        </div>
        
        <div className="use-cases-grid">
          {useCases.map((useCase, index) => (
            <div 
              className="use-case-card" 
              key={useCase.id}
              style={{
                '--animation-delay': `${index * 0.1}s`
              }}
            >
              <div className="use-case-icon">{useCase.icon}</div>
              <h3>{useCase.name}</h3>
              <p>{useCase.description}</p>
              <Link to={`/use-case/${useCase.id}`} className="use-case-link">
                <span>View Recommendations</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          ))}
        </div>
      </section>
      
      {/* Categories Section */}
      <section className="pyro-categories">
        <div className="section-header">
          <h2>Browse Categories</h2>
          <p>Find components by category to build or upgrade your PC</p>
        </div>
        
        <div className="category-grid">
          {categories.map((category, index) => (
            <div 
              className="category-card" 
              key={category.id}
              onMouseEnter={() => setHovered(category.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                '--accent-color': category.color,
                '--animation-delay': `${index * 0.1}s`
              }}
            >
              <div className="category-icon">
                <img src={`/assets/${category.icon}`} alt={category.name} />
              </div>
              <h3>{category.name}</h3>
              <div className={`hover-indicator ${hovered === category.id ? 'active' : ''}`}></div>
              <Link to={`/compare/${category.id}`} className="category-link">
                <span>Compare Prices</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          ))}
        </div>
      </section>
      
      {/* Price Comparison Examples */}
      <section className="pyro-featured">
        <div className="section-header">
          <h2>Featured Deals</h2>
          <p>The hottest hardware deals from across the web</p>
        </div>
        
        <div className="featured-products">
          <div className="product-card">
            <div className="product-badge">Best Value</div>
            <div className="product-image">
              <img src="/assets/hardware/gpu.png" alt="Graphics Card" />
            </div>
            <div className="product-details">
              <h3>RTX 4080 Super Gaming</h3>
              <div className="product-specs">
                <span>16GB GDDR6X</span>
                <span>DLSS 3.0</span>
              </div>
              <div className="retailer-prices">
                <div className="retailer-price">
                  <span className="retailer">AmazonTech</span>
                  <span className="price">$1,199.99</span>
                </div>
                <div className="retailer-price best">
                  <span className="retailer">MicroCenter</span>
                  <span className="price">$1,149.99</span>
                </div>
                <div className="retailer-price">
                  <span className="retailer">Newegg</span>
                  <span className="price">$1,229.99</span>
                </div>
              </div>
              <button className="compare-all-btn">Compare All Prices</button>
            </div>
          </div>
          
          <div className="product-card">
            <div className="product-badge">Price Drop</div>
            <div className="product-image">
              <img src="/assets/hardware/aio.png" alt="AIO Cooler" />
            </div>
            <div className="product-details">
              <h3>Arctic Liquid Cooler III</h3>
              <div className="product-specs">
                <span>360mm Radiator</span>
                <span>RGB Pump</span>
              </div>
              <div className="retailer-prices">
                <div className="retailer-price">
                  <span className="retailer">TechWorld</span>
                  <span className="price">$149.99</span>
                </div>
                <div className="retailer-price best">
                  <span className="retailer">PC Parts</span>
                  <span className="price">$129.99</span>
                </div>
                <div className="retailer-price">
                  <span className="retailer">eComponents</span>
                  <span className="price">$154.99</span>
                </div>
              </div>
              <button className="compare-all-btn">Compare All Prices</button>
            </div>
          </div>
          
          <div className="product-card">
            <div className="product-badge">Trending</div>
            <div className="product-image">
              <img src="/assets/hardware/keeb.webp" alt="Keyboard" />
            </div>
            <div className="product-details">
              <h3>Mechanical Gaming Keyboard</h3>
              <div className="product-specs">
                <span>Cherry MX Blue</span>
                <span>Per-key RGB</span>
              </div>
              <div className="retailer-prices">
                <div className="retailer-price">
                  <span className="retailer">GamerGear</span>
                  <span className="price">$129.99</span>
                </div>
                <div className="retailer-price best">
                  <span className="retailer">BestBuy</span>
                  <span className="price">$114.99</span>
                </div>
                <div className="retailer-price">
                  <span className="retailer">KeyboardKing</span>
                  <span className="price">$119.99</span>
                </div>
              </div>
              <button className="compare-all-btn">Compare All Prices</button>
            </div>
          </div>
        </div>
        
        <div className="view-all-products">
          <Link to="/deals" className="pyro-button secondary">View All Deals</Link>
        </div>
      </section>
      
      {/* Account Section */}
      <section className="pyro-account-section">
        <div className="account-content">
          <div className="account-text">
            <h2>Create Your Account</h2>
            <p>Track price drops, save builds, and get personalized deals for the components you care about.</p>
            
            <ul className="account-benefits">
              <li>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Price drop alerts for your wishlist
              </li>
              <li>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Save and share custom PC builds
              </li>
              <li>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Personalized deal recommendations
              </li>
            </ul>
          </div>
          
          <div className="account-buttons">
            <button onClick={openSignup} className="pyro-button primary large">
              Create Free Account
            </button>
            <button onClick={openLogin} className="pyro-button secondary large">
              Sign In
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;