import React from 'react';
import { Link } from 'react-router-dom';
import './Tutorial.css';

const Tutorial = () => {
  return (
    <div id="tutorial-container">
      <div id="tutorial-header">
        <div id="tutorial-nav-buttons">
          <Link to="/about" id="tutorial-nav-button" className={window.location.pathname === '/about' ? 'active' : ''}>
            About
          </Link>
          <Link to="/team" id="tutorial-nav-button" className={window.location.pathname === '/team' ? 'active' : ''}>
            Meet the Team
          </Link>
          <Link to="/tutorial" id="tutorial-nav-button" className={window.location.pathname === '/tutorial' ? 'active' : ''}>
            Tutorial
          </Link>
        </div>
      </div>
      <div id="tutorial-welcome">
        <h2 id="tutorial-welcome-title">Welcome to Pantry Helper</h2>
        <p id="tutorial-welcome-text">
          Pantry Helper offers different features and access levels based on your user role. Select your role below to learn more about the specific features available to you.
        </p>
        <div id="tutorial-role-buttons">
        <Link to="/tutorial/recipient" id="tutorial-role-button">Recipient Guide</Link>
        <Link to="/tutorial/staff" id="tutorial-role-button">Staff Guide</Link>
        <Link to="/tutorial/admin" id="tutorial-role-button">Admin Guide</Link>
      </div>
      </div>

      
      
      <div id="tutorial-overview">
        <h2 id="tutorial-overview-title">General Overview</h2>
        <p id="tutorial-overview-text">
          Pantry Helper is designed to streamline food pantry operations while providing an intuitive experience for all users. Here's what each user type can expect.
        </p>
        <div id="tutorial-roles">
    <div id="tutorial-recipient">
        <h2 id="tutorial-recipient-title">Recipients</h2>
        <ul id="tutorial-recipient-list">
            <li>Explore the pantry inventory to find available items.</li>
            <li>Submit and track item requests in real time.</li>
            <li>Receive notifications about request updates and new items.</li>
            <li>Get recipe recommendations based on pantry stock or custom preferences.</li>
            <li>Access a virtual pantry layout map.</li>
            <li>Communicate directly with pantry staff.</li>
            <li>View pantry events.</li>
        </ul>
    </div>

    <div id="tutorial-staff">
        <h2 id="tutorial-staff-title">Staff</h2>
        <ul id="tutorial-staff-list">
            <li>Access all recipient features.</li>
            <li>Manage inventory with real-time updates and alerts.</li>
            <li>Track incoming and outgoing donations.</li>
            <li>Track income and expenses.</li>
            <li>Manage recipient requests.</li>
            <li>Organize and promote pantry events.</li>
            <li>Analyze detailed data on donations and finances.</li>
        </ul>
    </div>

    <div id="tutorial-admin">
        <h2 id="tutorial-admin-title">Administrators</h2>
        <ul id="tutorial-admin-list">
            <li>Access all recipient and staff features.</li>
            <li>Manage pantry inventory and settings.</li>
        </ul>
    </div>
        </div>
      </div>

      
      <div id="tutorial-footer">
        <p>
          If you need additional assistance, contact us at <a href="mailto:pantryhelper.24@gmail.com" className="email-link">pantryhelper.24@gmail.com</a>
        </p>
      </div>
    </div>
  );
};

export default Tutorial;
