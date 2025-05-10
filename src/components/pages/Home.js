// Improved Home component with cleaner hero section and better UX

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCpu, FiHardDrive, FiServer, FiMonitor, FiGrid } from 'react-icons/fi';
import { BsCpu, BsGpuCard, BsMotherboard, BsDeviceSsd, BsFillCpuFill } from 'react-icons/bs';
import { CgSmartphoneRam } from 'react-icons/cg';
import { MdOutlineSdStorage } from 'react-icons/md';
import { RiComputerLine } from 'react-icons/ri';
import { FaFan, FaKeyboard, FaNetworkWired } from 'react-icons/fa';
import { BiPowerOff } from 'react-icons/bi';
import { IoGameController } from 'react-icons/io5';
import { HiOutlineDesktopComputer } from 'react-icons/hi';
import { MdOutlineVideoSettings } from 'react-icons/md';
import { BsBriefcase } from 'react-icons/bs';

function Home({ openLogin, openSignup, isLoggedIn }) {
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

  const categories = [
    { id: 'gpu', name: 'Graphics Cards', icon: <BsGpuCard size={32} />, color: '#ff5e5e' },
    { id: 'cpu', name: 'Processors', icon: <BsCpu size={32} />, color: '#5e9fff' },
    { id: 'motherboard', name: 'Motherboards', icon: <BsMotherboard size={32} />, color: '#5effb8' },
    { id: 'memory', name: 'Memory', icon: <CgSmartphoneRam size={32} />, color: '#ffdb5e' },
    { id: 'storage', name: 'Storage', icon: <MdOutlineSdStorage size={32} />, color: '#b05eff' },
    { id: 'psu', name: 'Power Supplies', icon: <BiPowerOff size={32} />, color: '#5effdb' },
    { id: 'case', name: 'Cases', icon: <RiComputerLine size={32} />, color: '#ff915e' },
    { id: 'cooling', name: 'Cooling', icon: <FaFan size={32} />, color: '#5e9fff' },
    { id: 'peripherals', name: 'Peripherals', icon: <FaKeyboard size={32} />, color: '#ff5ee7' }
  ];

  // Update your useCases array to include descriptions
  const useCases = [
    { 
      id: 'gaming', 
      name: 'Gaming', 
      icon: <IoGameController size={32} />, 
      color: '#ff5e5e',
      description: 'High-performance components for smooth gameplay and stunning visuals' 
    },
    { 
      id: 'office', 
      name: 'Office Work', 
      icon: <BsBriefcase size={32} />, 
      color: '#5e9fff',
      description: 'Reliable and efficient systems for productivity and multitasking' 
    },
    { 
      id: 'content', 
      name: 'Content Creation', 
      icon: <MdOutlineVideoSettings size={32} />, 
      color: '#5effb8',
      description: 'Powerful hardware for video editing, 3D rendering, and graphic design' 
    },
    { 
      id: 'server', 
      name: 'Servers & NAS', 
      icon: <FaNetworkWired size={32} />, 
      color: '#b05eff',
      description: 'Reliable solutions for data storage, networking, and home servers' 
    },
    { 
      id: 'workstation', 
      name: 'Workstation', 
      icon: <HiOutlineDesktopComputer size={32} />, 
      color: '#ff915e',
      description: 'Professional-grade components for demanding computational tasks' 
    }
  ];

  return (
    <div className="pyro-container">
      
      {/* Hero Section - Simplified with direct CTA buttons */}
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
            
            {/* Main CTA buttons - direct actions instead of generic "Shop Now" */}
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
                <div className="hardware-item" style={{"--final-x": "0px", "--final-y": "-120px", "--rotation": "0deg", "--delay": "0.1s"}}>
                  <BsCpu size={64} className="hardware-svg-icon" />
                </div>
                <div className="hardware-item" style={{"--final-x": "100px", "--final-y": "-60px", "--rotation": "-10deg", "--delay": "0.3s"}}>
                  <BsGpuCard size={64} className="hardware-svg-icon" />
                </div>
                <div className="hardware-item" style={{"--final-x": "100px", "--final-y": "60px", "--rotation": "-15deg", "--delay": "0.5s"}}>
                  <CgSmartphoneRam size={64} className="hardware-svg-icon" />
                </div>
                <div className="hardware-item" style={{"--final-x": "0px", "--final-y": "120px", "--rotation": "0deg", "--delay": "0.7s"}}>
                  <BsMotherboard size={64} className="hardware-svg-icon" />
                </div>
              </div>
              <img src="/assets/EasyWare.png" alt="EasyWare Logo" className="pyro-logo" />
              <div className="dark-ripple"></div>
            </div>
          </div>
        </div>
        
        {/* Removed hero-buttons and scroll-indicator sections */}
      </section>
      
      {/* How It Works Section - Enhanced with smooth transitions */}
      <section className="pyro-home-section how-it-works-section">
        <div className="pyro-container">
          <div className="section-header">
            <h2>How It Works</h2>
            <p>Build your dream PC in just a few steps</p>
          </div>
          
          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-icon">
                <BsGpuCard size={40} />
              </div>
              <h3>Pick Your Parts</h3>
              <p>Browse through our wide selection of components or start with a template build</p>
            </div>
            
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-icon">
                <BsFillCpuFill size={40} />
              </div>
              <h3>Automatic Compatibility</h3>
              <p>Our system ensures all your components work together perfectly</p>
            </div>
            
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-icon">
                <RiComputerLine size={40} />
              </div>
              <h3>Compare & Save</h3>
              <p>Find the best prices from our trusted retailers and save money</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Use Cases Section - Better visual design */}
      <section className="pyro-home-section use-cases-section">
        <div className="pyro-container">
          <div className="section-header">
            <h2>Shop by Use Case</h2>
            <p>Find the perfect PC for your needs</p>
          </div>
          
          <div className="use-cases-grid">
            {useCases.map(useCase => (
              <div key={useCase.id} className="use-case-card">
                <div className="use-case-icon" style={{ backgroundColor: `${useCase.color}15`, color: useCase.color }}>
                  {useCase.icon}
                </div>
                <h3>{useCase.name}</h3>
                <p>{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Categories Section - Enhanced visuals */}
      <section className="pyro-home-section categories-section">
        <div className="pyro-container">
          <div className="section-header">
            <h2>Shop by Category</h2>
            <p>Find the perfect components for your build</p>
          </div>
          
          <div className="categories-grid">
            {categories.map(category => (
              <div key={category.id} className="category-card">
                <div className="category-icon" style={{ backgroundColor: `${category.color}15`, color: category.color }}>
                  {category.icon}
                </div>
                <h3>{category.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Featured Deals - Better visual hierarchy */}
      <section className="pyro-featured">
        <div className="section-header">
          <span className="section-eyebrow">Current Savings</span>
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
              <Link to="/compare/gpu/rtx-4080-super" className="compare-all-btn">Compare All Prices</Link>
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
              <Link to="/compare/cooling/arctic-liquid-iii" className="compare-all-btn">Compare All Prices</Link>
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
              <Link to="/compare/peripherals/mechanical-keyboard" className="compare-all-btn">Compare All Prices</Link>
            </div>
          </div>
        </div>
        
        <div className="view-all-products">
          <Link to="/deals" className="pyro-button secondary">View All Deals</Link>
        </div>
      </section>
      
      {/* Account Section - conditionally rendered with improved design */}
      {!isLoggedIn && (
        <section className="pyro-account-section">
          <div className="account-content">
            <div className="account-text">
              <span className="section-eyebrow">Personalized Experience</span>
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
      )}
    </div>
  );
}

export default Home;