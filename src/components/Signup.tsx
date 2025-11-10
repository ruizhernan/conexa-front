import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Signup: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const emailRegex = React.useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/, []);

  useEffect(() => {
    let currentUsernameError = '';
    let currentPasswordError = '';

    if (usernameTouched && !username) {
      currentUsernameError = 'Username (Email) is required.';
    } else if (usernameTouched && !emailRegex.test(username)) {
      currentUsernameError = 'Please enter a valid email address.';
    }
    setUsernameError(currentUsernameError);

    if (passwordTouched && !password) {
      currentPasswordError = 'Password is required.';
    } else if (passwordTouched && password.length < 6) {
      currentPasswordError = 'Password must be at least 6 characters long.';
    }
    setPasswordError(currentPasswordError);

    if (username && password && !currentUsernameError && !currentPasswordError) {
      setIsFormValid(true);
    } else {
      setIsFormValid(false);
    }
  }, [username, password, usernameTouched, passwordTouched, emailRegex]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    setUsernameTouched(true);
    setPasswordTouched(true);

    let submitUsernameError = '';
    let submitPasswordError = '';

    if (!username) {
      submitUsernameError = 'Username (Email) is required.';
    } else if (!emailRegex.test(username)) {
      submitUsernameError = 'Please enter a valid email address.';
    }

    if (!password) {
      submitPasswordError = 'Password is required.';
    } else if (password.length < 6) {
      submitPasswordError = 'Password must be at least 6 characters long.';
    }

    setUsernameError(submitUsernameError);
    setPasswordError(submitPasswordError);

    if (submitUsernameError || submitPasswordError) {
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/v1/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        setMessage('User registered successfully! Redirecting to Sign In...');
        setUsername('');
        setPassword('');
        setUsernameTouched(false);
        setPasswordTouched(false);
        setTimeout(() => {
          navigate('/signin');
        }, 2000);
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || 'Signup failed. Please try again.');
      }
    } catch (error) {
      setMessage('Network error. Please try again later.');
      console.error('Signup error:', error);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
      <form onSubmit={handleSignup}>
        <div className="form-group mb-4">
          <label htmlFor="username" className="form-label">
            Username (Email)
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onBlur={() => setUsernameTouched(true)}
            required
            className="form-input"
          />
          {usernameTouched && usernameError && <p className="error-message">{usernameError}</p>}
        </div>
        <div className="form-group mb-6">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <div className="password-input-container">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setPasswordTouched(true)}
              required
              className="form-input"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="password-toggle-button"
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                  <path fillRule="evenodd" d="M1.323 11.447A8.958 8.958 0 0112 3c2.92 0 5.657 1.09 7.776 2.929.535.418.813 1.107.676 1.766a.995.995 0 01-.676.676C17.657 8.91 15.02 10 12 10c-2.92 0-5.657-1.09-7.776-2.929a.995.995 0 01-.676-.676c-.137-.659.14-1.348.676-1.766z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                  <path fillRule="evenodd" d="M1.323 11.447A8.958 8.958 0 0112 3c2.92 0 5.657 1.09 7.776 2.929.535.418.813 1.107.676 1.766a.995.995 0 01-.676.676C17.657 8.91 15.02 10 12 10c-2.92 0-5.657-1.09-7.776-2.929a.995.995 0 01-.676-.676c-.137-.659.14-1.348.676-1.766z" clipRule="evenodd" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m-3-3h6" />
                </svg>
              )}
            </button>
          </div>
          {passwordTouched && passwordError && <p className="error-message">{passwordError}</p>}
        </div>
        <button
          type="submit"
          className="form-button"
          disabled={!isFormValid}
        >
          Sign Up
        </button>
      </form>
      {message && <p className="message">{message}</p>}
      <p className="message mt-4">
        Already have an account?{' '}
        <Link to="/signin" className="link">
          Sign In
        </Link>
      </p>
    </div>
  );
};

export default Signup;