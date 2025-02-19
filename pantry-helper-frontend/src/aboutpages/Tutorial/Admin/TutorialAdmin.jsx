import React from 'react';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import './TutorialAdmin.css';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const TutorialAdmin = () => {
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true
  };

  return (
    <div id="tutorial-admin-container">
      <div id="tutorial-admin-header">
        <div id="tutorial-admin-nav-buttons">
          
        <Link to="/tutorial" id="tutorial-recipient-nav-button" className={window.location.pathname === '/tutorial' ? 'active' : ''}>
            Tutorial (Main)
          </Link>
          <Link to="/tutorial/recipient" id="tutorial-recipient-nav-button" className={window.location.pathname === '/tutorial/recipient' ? 'active' : ''}>
            Recipient Tutorial 
          </Link>
          <Link to="/tutorial/staff" id="tutorial-recipient-nav-button" className={window.location.pathname === '/tutorial/staff' ? 'active' : ''}>
            Staff Tutorial
          </Link>
          <Link to="/tutorial/admin" id="tutorial-recipient-nav-button" className={window.location.pathname === '/tutorial/admin' ? 'active' : ''}>
            Admin Tutorial 
          </Link>
        </div>
      </div>

      <div id="tutorial-admin-content">
        <h1 id="tutorial-admin-title">Admin Tutorial</h1>

        <section id="tutorial-admin-getting-started">
          <div className="tutorial-section-content">
            <h3>Full System Access</h3>
            <ul>
              <li>As an admin, you have access to all features available to Recipients and Staff</li>
            </ul>

            <h3>Managing Pantries</h3>
            <img src="../tutorial_admin_image/pantry.png" alt="Pantry Management" />
            <ul>
              <li>Navigate to the Pantry Management section</li>
              <li>Add or update pantry details such as name and access codes</li>
              <li>Oversee multiple pantry branches and ensure they are functioning efficiently</li>
            </ul>
            
            <div className="event-image-container">
              <img src="../tutorial_admin_image/newpantry.png" alt="Pantry Request" />
              <p>Email sent to the admin when a new pantry is requested</p>
            </div>
          </div>
        </section>

        <section id="tutorial-admin-use-cases">
          <h2>Common Use Cases</h2>
          <div className="tutorial-section-content">
            <h3>Setting Up New Pantry</h3>
            <div className="use-case-container">
              <div className="use-case-text">
                <ul>
                  <li>Scenario: Processing a new pantry registration request</li>
                  <li>Steps:
                    <ol>
                      <li>Review incoming pantry request email</li>
                      <li>Verify the provided details, such as pantry name, contact information</li>
                      <li>Navigate to the Pantry page and create a new pantry profile in the system, entering details such as name and access codes</li>
                      <li>Send access codes to pantry staff</li>
                      <li>Monitor the initial setup to ensure the pantry is operational and provide ongoing support as needed</li>
                    </ol>
                  </li>
                </ul>
              </div>
              <div className="use-case-slider">
                <Slider {...sliderSettings}>
                  <div>
                    <img src="../tutorial_admin_image/newpantry.png" alt="Pantry Request" />
                  </div>
                  <div>
                    <img src="../tutorial_admin_image/pantry.png" alt="Pantry Management" />
                  </div>
                  <div>
                    <img src="../tutorial_admin_image/addnewpantry.png" alt="Pantry Add" />
                  </div>
                </Slider>
              </div>
            </div>

            <h3>Editing Pantry Information</h3>
            <div className="use-case-container">
              <div className="use-case-text">
                <ul>
                  <li>Scenario: Updating pantry information such as name or access codes</li>
                  <li>Steps:
                    <ol>
                      <li>Navigate to the Pantry page</li>
                      <li>Click on the green Edit button</li>
                      <li>Update the necessary information</li>
                    </ol>
                  </li>
                </ul>
              </div>
              <div className="use-case-slider">
                <Slider {...sliderSettings}>
                  <div>
                    <img src="../tutorial_admin_image/pantry.png" alt="Pantry Management" />
                  </div>
                  <div>
                    <img src="../tutorial_admin_image/editpantry.png" alt="Pantry Edit" />
                  </div>
                </Slider>
              </div>
            </div>

            <h3>Deleting Pantry</h3>
            <div className="use-case-container">
              <div className="use-case-text">
                <ul>
                  <li>Scenario: Removing a pantry from the system that is no longer operational or relevant</li>
                  <li>Steps:
                    <ol>
                      <li>Navigate to the Pantry page</li>
                      <li>Use the search bar to look for the pantry you want to delete by name</li>
                      <li>Click on the red Delete button next to the pantry's name</li>
                    </ol>
                  </li>
                </ul>
              </div>
              <div className="use-case-slider">
                <Slider {...sliderSettings}>
                  <div>
                    <img src="../tutorial_admin_image/pantry.png" alt="Pantry Management" />
                  </div>
                  <div>
                    <img src="../tutorial_admin_image/searchpantry.png" alt="Pantry Search" />
                  </div>
                </Slider>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TutorialAdmin;
