import React from 'react';
import { Link } from 'react-router-dom';
import './About.css'; 

const About = () => {
  return (
    <div id="about-main-container">
      <div id="about-header">
        <div id="about-nav-buttons">
          <Link to="/about" id="about-nav-button" className={window.location.pathname === '/about' ? 'active' : ''}>
            About
          </Link>
          <Link to="/team" id="about-nav-button" className={window.location.pathname === '/team' ? 'active' : ''}>
            Meet the Team
          </Link>
          <Link to="/tutorial" id="about-nav-button" className={window.location.pathname === '/tutorial' ? 'active' : ''}>
            Tutorial
          </Link>
        </div>
      </div>

      <div id="about-content">
        <div id="about-row-1">
          <section id="about-purpose">
            <h2>Purpose</h2>
            <p>
              Pantry Helper is a feature-rich, web-based platform designed to enhance the efficiency, transparency, and accessibility of food pantry operations. Developed with a focus on the Feed U Pantry at the University of Utah, this application bridges the gap between pantry staff, donors, and recipients by simplifying core processes such as donation management, inventory tracking, and data visualization.
            </p>
            <p>
              The platform empowers pantry staff to streamline operations through tools for managing stock, organizing events, and generating insightful reports. Recipients benefit from an intuitive interface that allows them to explore pantry inventory, request items, and discover recipes tailored to the available supplies. Donors can track their contributions and engage with the pantry more effectively.
            </p>
            <p>
              Key features like automated donation recording, virtual pantry mapping, and recipe recommendations help reduce manual effort and enhance user experience. Advanced analytics provide actionable insights into inventory trends, popular items, and financial data, enabling pantries to make informed decisions that improve service quality. With its comprehensive suite of tools, Pantry Helper not only supports day-to-day operations but also fosters a sense of community by improving communication and collaboration among stakeholders.
            </p>
            <p>
              By integrating innovation with practicality, Pantry Helper aims to revolutionize food pantry management, ensuring that resources are utilized efficiently to serve those in need.
            </p>
          </section>
        </div>

        <div id="about-row-2">
          <div id="about-row-2-left">
            <section id="about-target">
              <h2>Target</h2>
              <ul>
                <li>Pantry Employees: Simplifies inventory management with real-time tracking and alerts.</li>
                <li>Donors: Encourages support through clear communication and visibility into pantry needs.</li>
                <li>Recipients: Enhances experience with several features, such as requests, recipe recommendations, and notifications.</li>
              </ul>
            </section>
            <section id="about-impact">
              <h2>Impact/Significance</h2>
              <ul>
                <li>Efficiency: Replaces multiple tools with a single platform.</li>
                <li>Informed Decisions: Uses analytics to predict needs and optimize inventory.</li>
                <li>Empowerment: Provides easy access to information and personalized features for users.</li>
              </ul>
            </section>
          </div>

          <div id="about-row-2-right">
            <section id="about-design">
              <h2>Design and User Experience (UX)</h2>
              <div id="about-design-user">
                <h3>User-Centric Approach</h3>
                <ul>
                  <li>Simplicity and accessibility focused design</li>
                  <li>Clean and intuitive interface for effortless navigation</li>
                  <li>Centralized features for minimal complexity</li>
                </ul>
              </div>
              <p></p>
              <div id="about-design-inclusive">
                <h3>Inclusive Design</h3>
                <ul>
                  <li>Color-coded indicators for inventory levels</li>
                  <li>Real-time notifications via EmailJS integration</li>
                  <li>Multiple data visualization options</li>
                  <li>Streamlined workflows tailored to different user roles (recipients, staff, and admin) for a more personalized experience.</li>
                </ul>
              </div>
            </section>
          </div>
        </div>

        <div id="about-row-3">
          <section id="about-architecture">
            <h2>System Architecture</h2>
            <img src="/about_image/SystemArchitecture.png" alt="System Architecture Diagram" id="about-architecture-image" />
          </section>
          <section id="about-database">
            <h2>Database Design</h2>
            <img src="/about_image/Database.png" alt="Database Schema" id="about-database-image" />
          </section>
        </div>
      </div>
    </div>
  );
};

export default About;
