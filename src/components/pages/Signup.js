/* filepath: /c:/Users/vanus/OneDrive/Documents/Final Project/src/pages/Signup.js */
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../auth.css';

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [serverStatus, setServerStatus] = useState(null);

  // Check server status when component mounts
  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/status');
        setServerStatus(response.data);
      } catch (err) {
        setServerStatus({ status: 'offline', error: err.message });
      }
    };
    
    checkServerStatus();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    // Confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsLoading(true);
    setGeneralError('');
    setErrors({});
    
    try {
      // Check server status first
      try {
        await axios.get('http://localhost:5000/api/status');
      } catch (err) {
        throw new Error('Server is currently unreachable. Please try again later.');
      }
      
      // Attempt registration
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      // Store token and user data in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Redirect to home page after successful signup
      navigate('/');
      
    } catch (err) {
      console.error('Signup error:', err);
      
      if (err.response?.data?.validationErrors) {
        // Handle field-specific validation errors from backend
        setErrors(err.response.data.validationErrors);
      } else {
        // Handle general error
        setGeneralError(err.response?.data?.message || err.message || 'Signup failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <div className="auth-card">
          <div className="auth-logo">
            <img src="/assets/EasyWare.png" alt="EasyWare Logo" className="auth-logo-img" />
          </div>
          
          <h2>Create Your Account</h2>
          <p>Get access to price tracking and personalized hardware deals</p>
          
          {serverStatus && serverStatus.status === 'offline' && (
            <div className="auth-error">
              Server is currently offline. Sign up may not work.
            </div>
          )}
          
          {generalError && (
            <div className="auth-error">
              {generalError}
            </div>
          )}
          
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
                className={errors.name ? 'error' : ''}
                disabled={isLoading}
              />
              {errors.name && <div className="error-message">{errors.name}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input 
                type="email" 
                id="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com" 
                className={errors.email ? 'error' : ''}
                disabled={isLoading}
              />
              {errors.email && <div className="error-message">{errors.email}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input 
                type="password" 
                id="password" 
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password" 
                className={errors.password ? 'error' : ''}
                disabled={isLoading}
              />
              {errors.password && <div className="error-message">{errors.password}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input 
                type="password" 
                id="confirmPassword" 
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password" 
                className={errors.confirmPassword ? 'error' : ''}
                disabled={isLoading}
              />
              {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
            </div>
            
            <button 
              type="submit" 
              className="auth-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
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
            Already have an account? <Link to="/login">Sign In</Link>
          </div>
          
          {/* Debug info - you can remove this in production */}
          {serverStatus && (
            <div className="server-status" style={{fontSize: "0.7rem", opacity: 0.7, marginTop: "1rem", textAlign: "center"}}>
              Server: {serverStatus.status} 
              {serverStatus.mongodb && ` | MongoDB: ${serverStatus.mongodb}`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Signup;