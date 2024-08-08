import React, { useState } from 'react';
import './LoginPage.css';
import { useNavigate } from 'react-router-dom';
import { FaRegUser, FaLock, FaEnvelope } from "react-icons/fa";

const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isPopupActive, setPopupActive] = useState(false);
  const [isRegisterActive, setRegisterActive] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    const adminUsername = 'admin';
    const adminPassword = '123';
    const Username = 'user';
    const Password = '123';

    if (username === adminUsername && password === adminPassword) {
      navigate('/admin');
    } 
    else if (username === Username && password === Password) {
      navigate('/attendance');
    } 
    else {
      alert('Invalid username or password');
    }
  };


  return (
    <div className="container">
      <header>
        <h2 className="logo">LOGO</h2>
        <nav className="navigation">
          <a href="/home">Home</a>
          <a href="/about_us">About</a>
          <a href="/services">Services</a>
          <a href="/contact">Contact</a>
          <button className="btnLogin-popup" onClick={() => setPopupActive(true)}>Login</button>
        </nav>
      </header>
      <div className={`wrapper ${isPopupActive ? 'active-popup' : ''} ${isRegisterActive ? 'active' : ''}`}>
        <span className="icon-close" onClick={() => setPopupActive(false)}>✖</span>
        <div className="form-box">
          <h2>Login</h2>
          <form id="form" onSubmit={handleLogin}>
            <div className="input-box">
              <span className="icon"><FaRegUser /></span>
              <input
                type="text"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <label>Username</label>
            </div>
            <div className="input-box">
              <span className="icon"><FaLock /></span>
              <input
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <label>Password</label>
            </div>
            <div className="remember-forgot">
              <label>        </label>
              <a href="#">Forgot Password</a>
            </div>
            <button type="submit" className="btn">Login</button>
            <div className="login-register">
              <p>Don't have an Account?<a href="#" className="register-link" onClick={() => setRegisterActive(true)}>Register</a></p>
            </div>
          </form>
        </div>
        <div className="form-box-register">
          <h2>Registration</h2>
          <form>
            <div className="input-box">
              <span className="icon"><FaRegUser /></span>
              <input type="text" required />
              <label>User Name</label>
            </div>
            <div className="input-box">
              <span className="icon"><FaEnvelope /></span>
              <input type="email" required />
              <label>Email</label>
            </div>
            <div className="input-box">
              <span className="icon"><FaLock /></span>
              <input type="password" required />
              <label>Password</label>
            </div>
            <div className="remember-forgot">
              <label></label>
            </div>
            <button type="submit" className="btn">Register</button>
            <div className="login-register">
              <p>Already have an Account?<a href="#" className="login-link" onClick={() => setRegisterActive(false)}>Login</a></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
