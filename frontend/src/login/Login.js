import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  // States for account creation
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [createError, setCreateError] = useState(null);
  const [createMessage, setCreateMessage] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password })
      });
      
      if (response.ok) {
        console.log("Login successful, navigating to dashboard");
        localStorage.setItem("username", username);
        navigate('/app');
      } else {
        const data = await response.json();
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Error during login:', err);
      setError('An error occurred. Please try again.');
    }
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: newUsername, password: newPassword })
      });
      
      if (response.ok) {
        setCreateMessage('Account created successfully! Please log in.');
        setCreateError(null);
        setNewUsername('');
        setNewPassword('');
        // Optionally close the modal
        setShowCreateAccount(false);
      } else {
        const data = await response.json();
        setCreateError(data.message || 'Account creation failed.');
      }
    } catch (err) {
      console.error('Error during account creation:', err);
      setCreateError('An error occurred. Please try again.');
    }
  };

  return (
    <div>
      <div className="background"></div>
      
      <div className="login-container">
        <h1>Login</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username:</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              placeholder="Enter username" 
              required 
            />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Enter password" 
              required 
            />
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit">Login</button>
        </form>
        <button 
          className="create-account-toggle"
          onClick={() => setShowCreateAccount(true)}
        >
          Create Account
        </button>
      </div>
      
      {/* Create Account Modal */}
      {showCreateAccount && (
        <div className="create-account-modal">
          <div className="create-account-popup">
            <button 
              className="close-button" 
              onClick={() => setShowCreateAccount(false)}
            >
              X
            </button>
            <h2>Create Account</h2>
            <form onSubmit={handleCreateAccount}>
              <div className="form-group">
                <label>New Username:</label>
                <input 
                  type="text" 
                  value={newUsername} 
                  onChange={(e) => setNewUsername(e.target.value)} 
                  placeholder="Enter new username" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>New Password:</label>
                <input 
                  type="password" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  placeholder="Enter new password" 
                  required 
                />
              </div>
              {createError && <p className="error">{createError}</p>}
              {createMessage && <p>{createMessage}</p>}
              <button type="submit">Create Account</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
