import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isRegistering) {
      const result = await register(email, password, name);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message);
      }
    } else {
      const result = await login(email, password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message);
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-header">
        <div className="logo">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="8" fill="#4A90E2"/>
            <path d="M20 12L12 18V28H28V18L20 12Z" fill="white"/>
            <path d="M20 12V28" stroke="white" strokeWidth="2"/>
          </svg>
        </div>
        <h1>University Portal</h1>
        <p>Complaint Management System</p>
      </div>

      <div className="login-card">
        <div className="login-card-header">
          <h2>Welcome Back</h2>
          <p>Sign in to access your account</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          {isRegistering && (
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <div className="input-wrapper">
                <svg className="input-icon" width="0" height="0" viewBox="0 0 0 0" fill="none">
                  <path d="M10 10C12.7614 10 15 7.76142 15 5C15 2.23858 12.7614 0 10 0C7.23858 0 5 2.23858 5 5C5 7.76142 7.23858 10 10 10Z" fill="#9CA3AF"/>
                  <path d="M10 12C5.58172 12 2 15.5817 2 20H18C18 15.5817 14.4183 12 10 12Z" fill="#9CA3AF"/>
                </svg>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">University Email</label>
            <div className="input-wrapper">
              <svg className="input-icon" width="0" height="0" viewBox="0 0 0 0" fill="none">
                <path d="M2.5 6.66667L10 11.6667L17.5 6.66667M3.33333 15H16.6667C17.5871 15 18.3333 14.2538 18.3333 13.3333V6.66667C18.3333 5.74619 17.5871 5 16.6667 5H3.33333C2.41286 5 1.66667 5.74619 1.66667 6.66667V13.3333C1.66667 14.2538 2.41286 15 3.33333 15Z" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@university.edu"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <svg className="input-icon" width="" height="" viewBox="0 0 0 0" fill="none">
                <path d="M15 9.16667V5.83333C15 3.16667 12.8333 1 10 1C7.16667 1 5 3.16667 5 5.83333V9.16667M10 14.1667V16.6667M5 19H15C16.3807 19 17.5 17.8807 17.5 16.5V11.5C17.5 10.1193 16.3807 9 15 9H5C3.61929 9 2.5 10.1193 2.5 11.5V16.5C2.5 17.8807 3.61929 19 5 19Z" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          <button type="submit" className="sign-in-btn">
            {isRegistering ? 'Create Account' : 'Sign In'}
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M7.5 15L12.5 10L7.5 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </form>

        {!isRegistering && (
          <>
            <div className="divider">
              <span>Don't have an account?</span>
            </div>
            <button
              type="button"
              className="create-account-btn"
              onClick={() => setIsRegistering(true)}
            >
              Create Student Account
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 5V15M5 10H15" stroke="#6B7280" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </>
        )}

        {isRegistering && (
          <button
            type="button"
            className="back-to-login-btn"
            onClick={() => setIsRegistering(false)}
          >
            Back to Login
          </button>
        )}

        <div className="demo-credentials">
          <h3>Demo Credentials:</h3>
          <p><strong>Admin:</strong> admin@university.edu / admin123</p>
          <p><strong>Student:</strong> john.smith@university.edu / student123</p>
        </div>

        <p className="admin-note">Admin accounts are managed</p>
      </div>
    </div>
  );
};

export default Login;
