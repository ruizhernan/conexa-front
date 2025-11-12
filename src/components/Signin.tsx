import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Signin: React.FC = () => {

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



  const handleSignin = async (e: React.FormEvent) => {

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

              const response = await fetch('http://srv559732.hstgr.cloud:8080/api/v1/auth/signin', {

                method: 'POST',

                headers: {

                  'Content-Type': 'application/json',

                },

                body: JSON.stringify({ username, password }),

              });

        

              if (response.ok) {

                const data = await response.json();

                localStorage.setItem('jwt_token', data.token);

                localStorage.setItem('user_role', data.role);

                setMessage('Signin successful! Redirecting...');

                setUsername('');

                setPassword('');

                setUsernameTouched(false);

                setPasswordTouched(false);

                navigate('/');

              } else {

                const errorData = await response.json();

                setMessage(errorData.message || 'Signin failed. Please check your credentials.');

              }

            } catch (error) {

              setMessage('Network error. Please try again later.');

              console.error('Signin error:', error);

            }

          };



  return (

    <div>

      <h2 className="text-2xl font-bold mb-6 text-center">Sign In</h2>

      <form onSubmit={handleSignin}>

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

                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">

                              <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.622a8.967 8.967 0 000 6.75.75.75 0 01-.713.513A9.735 9.735 0 01.25 12c0-3.109 1.35-5.977 3.517-8.015a.75.75 0 01.713.513zm11.03 0a8.967 8.967 0 000 6.75.75.75 0 01.713.513c1.965 2.045 3.517 4.913 3.517 8.015a.75.75 0 01-.713-.513z" />

                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a3 3 0 100-6 3 3 0 000 6z" />

                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m-3-3h6" />

                            </svg>

                          ) : (

                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">

                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />

                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />

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

          Sign In

        </button>

      </form>

      {message && <p className="message">{message}</p>}

      <p className="message mt-4">

        Don't have an account?{' '}

        <Link to="/signup" className="link">

          Sign Up

        </Link>

      </p>

    </div>

  );

};



export default Signin;
