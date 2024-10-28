import React, { useState } from 'react';
import styles from "./Login.module.css";
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [userData, setUserData] = useState({
    email: '',
    password: ''
  });
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
    const loginUser = async () => {
    // **Basic Validation**
    if (!userData.email || !userData.password) {
      setErrorMessage('Email and password are required.');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // **Email regex pattern**
    if (!emailPattern.test(userData.email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (userData.password.length < 6) { // **Password length validation**
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setErrorMessage('');


  const loginUser = async () => {
    try {
      const response = await axios.post('http://localhost:8082/login', userData);

      if (response.data.success) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate('/profile');
      } else {
        setErrorMessage(response.data.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('An error occurred while logging in. Please try again.');
    }
  };

  return (
    <div className={styles.mainContainer}>
      <div className={styles.formContainer}>
        <input
          type="email"
          required
          placeholder="Enter Your Email Address"
          onChange={(e) => setUserData({ ...userData, email: e.target.value })}
          className={styles.userEmailInput}
        />
        <input
          type="password"
          required
          placeholder="Enter Your Password"
          onChange={(e) => setUserData({ ...userData, password: e.target.value })}
          className={styles.userPasswordInput}
        />
        {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
        <button className={styles.submitButton} onClick={loginUser}>Login</button>

        <Link to="/signup">
          <p className={styles.link}>Don't Have An Account? Signup now!</p>
        </Link>
      </div>
    </div>
  );
};

export default Login;
