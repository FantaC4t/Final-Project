import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './auth-modal.css';

function AuthModal({ isOpen, onClose, initialTab = 'login' }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    remember: false,
    agreeTerms: false
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Reference to the modal content
  const modalContentRef = useRef(null);
  
  // Handle scrolling the modal to top when tab changes
  useEffect(() => {
    if (modalContentRef.current) {
      modalContentRef.current.scrollTop = 0;
    }
    setError(''); // Clear errors when switching tabs
  }, [activeTab]);

  useEffect(() => {
    // Prevent body scrolling when modal is open
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    
    // Reset active tab when modal opens
    if (isOpen) {
      setActiveTab(initialTab);
      setError(''); // Clear any previous errors
    }
    
    // Cleanup
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen, initialTab]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing again
    if (error) setError('');
  };

  const validateSignupForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      setIsLoading(true);
      
      if (activeTab === 'login') {
        console.log('Attempting login with:', formData.email);
        
        const response = await axios.post('http://localhost:5000/api/auth/login', {
          email: formData.email,
          password: formData.password
        });
        
        console.log('Login successful:', response.data);
        
        // Store auth data
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Remember email if checked
        if (formData.remember) {
          localStorage.setItem('rememberedEmail', formData.email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }
        
        onClose();
        window.location.reload(); // Refresh to update auth state
        
      } else {
        // Signup flow
        if (!validateSignupForm()) {
          setIsLoading(false);
          return;
        }
        
        console.log('Attempting signup with:', formData.email);
        
        const response = await axios.post('http://localhost:5000/api/auth/register', {
          name: formData.name,
          email: formData.email,
          password: formData.password
        });
        
        console.log('Signup successful:', response.data);
        
        // Store auth data
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        onClose();
        window.location.reload(); // Refresh to update auth state
      }
    } catch (err) {
      console.error('Auth error:', err);
      
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.request) {
        setError('No response from server. Please check if the server is running.');
        console.error('No response received:', err.request);
      } else {
        setError('An error occurred. Please try again.');
        console.error('Error setting up request:', err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div 
        className="auth-modal-content" 
        onClick={e => e.stopPropagation()}
        ref={modalContentRef}
      >
        <button className="auth-modal-close" onClick={onClose}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        
        <div className="auth-logo">
          <img src="/assets/EasyWare.png" alt="EasyWare Logo" className="auth-logo-img" />
        </div>
        
        <div className="auth-tabs">
          <button 
            className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => setActiveTab('login')}
            disabled={isLoading}
          >
            Login
          </button>
          <button 
            className={`auth-tab ${activeTab === 'signup' ? 'active' : ''}`}
            onClick={() => setActiveTab('signup')}
            disabled={isLoading}
          >
            Sign Up
          </button>
        </div>
        
        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}
        
        {activeTab === 'login' ? (
          <>
            <h2>Welcome Back</h2>
            <p>Log in to your account to find the best hardware deals</p>
            
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@domain.com" 
                  required 
                  disabled={isLoading}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input 
                  type="password" 
                  id="password" 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••" 
                  required 
                  disabled={isLoading}
                />
              </div>
              
              <div className="form-options">
                <label className="checkbox-container">
                  <input 
                    type="checkbox" 
                    name="remember"
                    checked={formData.remember}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  <span className="checkmark"></span>
                  Remember me
                </label>
                
                <Link to="/forgot-password" className="forgot-password" onClick={onClose}>Forgot Password?</Link>
              </div>
              
              <button type="submit" className="auth-btn" disabled={isLoading}>
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
            
            <div className="auth-divider">or continue with</div>
            
            <div className="social-auth">
              <button className="social-auth-btn" disabled={isLoading}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z"/>
                </svg>
                Google
              </button>
              
              <button className="social-auth-btn" disabled={isLoading}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
                </svg>
                GitHub
              </button>
            </div>
            
            <div className="auth-footer">
              Don't have an account? <button className="text-link" onClick={() => setActiveTab('signup')} disabled={isLoading}>Create Account</button>
            </div>
          </>
        ) : (
          <>
            <h2>Create Account</h2>
            <p>Join us to access personalized price comparisons</p>
            
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name" 
                  required 
                  disabled={isLoading}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="signupEmail">Email Address</label>
                <input 
                  type="email" 
                  id="signupEmail" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@domain.com" 
                  required 
                  disabled={isLoading}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="signupPassword">Password</label>
                <input 
                  type="password" 
                  id="signupPassword" 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••" 
                  required 
                  disabled={isLoading}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input 
                  type="password" 
                  id="confirmPassword" 
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••" 
                  required 
                  disabled={isLoading}
                />
              </div>
              
              <div className="form-options">
                <label className="checkbox-container">
                  <input 
                    type="checkbox" 
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                  <span className="checkmark"></span>
                  I agree to the <Link to="/terms" onClick={onClose}>Terms of Service</Link>
                </label>
              </div>
              
              <button type="submit" className="auth-btn" disabled={isLoading}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
            
            <div className="auth-divider">or sign up with</div>
            
            <div className="social-auth">
              <button className="social-auth-btn" disabled={isLoading}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z"/>
                </svg>
                Google
              </button>
              
              <button className="social-auth-btn" disabled={isLoading}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
                </svg>
                GitHub
              </button>
            </div>
            
            <div className="auth-footer">
              Already have an account? <button className="text-link" onClick={() => setActiveTab('login')} disabled={isLoading}>Log In</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AuthModal;