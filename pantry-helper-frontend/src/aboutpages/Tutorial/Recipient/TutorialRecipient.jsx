import React from 'react';
import { Link } from 'react-router-dom';
import './TutorialRecipient.css';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const sliderSettings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  arrows: true
};

const TutorialRecipient = () => {
  return (
    <div id="tutorial-recipient-container">
      <div id="tutorial-recipient-header">
        <div id="tutorial-recipient-nav-buttons">
          
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

      <div id="tutorial-recipient-content">
        <h1 id="tutorial-recipient-title">Recipient Tutorial</h1>

        <section id="tutorial-recipient-getting-started">
          <div className="tutorial-section-content">
            <h3>Login</h3>
            <ul>
              <li>Use Google login to access your account</li>
            </ul>

            <h3>Manage Subscriptions</h3>
            
            <img src="../tutorial_recipient_image/managesubscription.png" alt="Manage Subscriptions" />
            <ul>
              <li>Go to the Manage Subscriptions section in Profile page to subscribe to your pantry</li>
              <li>If you have selected multiple pantries, you can switch between pantries using the navbar</li>
            </ul>

            <h3>Dashboard Overview</h3>
            <img src="../tutorial_recipient_image/dashboard.png" alt="Dashboard" />
            <ul>
              <li>After logging in, you'll land on your Dashboard</li>
              <li>The dashboard provides key information, including:</li>
              <ul>
                <li>Items in stock</li>
                <li>A randomly generated recipe idea</li>
                <li>A list of upcoming events</li>
              </ul>
            </ul>
            <h3>Exploring Inventory</h3>
            <img src="../tutorial_recipient_image/inventory.png" alt="Inventory" />
            <ul>
              <li>Navigate to the Inventory section from the menu</li>
              <li>Browse available pantry items, including details like quantity and location</li>
              <li>Use the search bar to quickly find specific items</li>
            </ul>

            <h3>Submitting a Request</h3>
            <ul>
              <li>Go to the Request page</li>
              <img src="../tutorial_recipient_image/request.png" alt="Requset" />
              <li>Submit the items you need from the inventory list by clicking the "Request" button</li>
              <li>Enter the quantity and submit your request</li>
              <li>Check the status of your requests in real time</li>
              <li>You can edit or delete incomplete requests, but you cannot edit or delete completed ones</li>
            </ul>

            <h3>Viewing Events</h3>
            <img src="../tutorial_recipient_image/event.png" alt="Events" />
            <ul>
              <li>Visit the Event page to stay informed about pantry activities</li>
              <li>Check details for upcoming events like food drives, workshops, or distribution days</li>
              <li>Include past events to review information if needed</li>
              <li>Receive email notifications about newly added or updated events. You can turn email notifications off from the Profile section if desired</li>
            </ul>

            <h3>Recipe Idea</h3>
            <img src="../tutorial_recipient_image/recipeidea.png" alt="Recipe Idea" />
            <ul>
              <li>Access the Recipe Idea section for meal inspiration</li>
              <li>View recipes based on items currently in stock at the pantry</li>
              <li>Customize recipes by adding additional ingredients you already have</li>
              <li>Green: In stock</li>
              <li>Blue: Few items left</li>
              <li>Red: No stock available</li>
            </ul>

            <h3>Accessing the Pantry Map</h3>
            <img src="../tutorial_recipient_image/map.png" alt="Pantry Map" />
            <ul>
              <li>Open the Map page to visualize the pantry layout</li>
              <li>Use this feature to save time during your pantry visits</li>
            </ul>

            <h3>Contacting Pantry Staff</h3>
            <img src="../tutorial_recipient_image/contactpantry.png" alt="Contact Pantry" />
            <ul>
              <li>Navigate to the Contact Pantry page to communicate directly with staff</li>
              <li>Send inquiries about your requests, items, or general pantry information</li>
              <li>Use this feature for quick support or clarification</li>
            </ul>

            <h3>Help Section</h3>
            <img src="../tutorial_recipient_image/help.png" alt="Help Section" />
            <ul>
              <li>Visit the Help page for FAQs and troubleshooting</li>
              <li>Learn how to navigate the platform and make the most of its features</li>
              <li>Use the category buttons in the upper-left corner or the search bar for easier navigation</li>
            </ul>

          </div>
        </section>

        <section id="tutorial-recipient-use-cases">
          <h2>Common Use Cases</h2>
          <div className="tutorial-section-content">
            <h3>Inventory Search</h3>
            <div className="use-case-container">
              <div className="use-case-text">
                <ul>
                  <li>Scenario: You need specific items for a family dinner</li>
                  <li>Steps:
                    <ol>
                      <li>Go to the Inventory page</li>
                      <li>Use the search bar to find items like "bread" and "pasta"</li>
                      <li>Check availability and location of each item</li>
                      <li>Go to request page and submit a request for "pasta"</li>
                    </ol>
                  </li>
                </ul>
              </div>
              <div className="use-case-slider">
                <Slider {...sliderSettings}>
                  <div>
                    <img src="../tutorial_recipient_image/feedupantry.png" alt="Feed U Pantry" />
                  </div>
                  <div>
                    <img src="../tutorial_recipient_image/bread.png" alt="Feed U Pantry Bread" />
                  </div>
                  <div>
                    <img src="../tutorial_recipient_image/requestblank.png" alt="Request Blank" />
                  </div>
                  <div>
                    <img src="../tutorial_recipient_image/requestpasta.png" alt="Request Pasta" />
                  </div>
                </Slider>
              </div>
            </div>

            <h3>Recipe Planning</h3>
            <div className="use-case-container">
              <div className="use-case-text">
                <ul>
                  <li>Scenario: Planning meals with available pantry items</li>
                  <li>Steps:
                    <ol>
                      <li>Visit the Recipe Idea section</li>
                      <li>Browse suggested recipes based on current inventory</li>
                      <li>Add ingredients you already have to the recipe: Apple, Banana</li>
                      <li>Generate the recipe and cook!</li>
                    </ol>
                  </li>
                </ul>
              </div>

                  <div>
                    <img src="../tutorial_recipient_image/recipeidea.png" alt="Recipe Ideas" />
                  </div>
                
         
            </div>

            <h3>Event Participation</h3>
            <div className="use-case-container">
              <div className="use-case-text">
                <ul>
                  <li>Scenario: Joining a holiday food drive event</li>
                  <li>Steps:
                    <ol>
                      <li>Check the Event page for upcoming food drive events</li>
                      <li>Note the date and location</li>
                      <li>Go to Contact Pantry page and send a message to the pantry staff ask questions about the event</li>
                    </ol>
                  </li>
                </ul>
              </div>
              <div className="use-case-slider">
                <Slider {...sliderSettings}>
                  <div>
                    <img src="../tutorial_recipient_image/event.png" alt="Event View" />
                  </div>
                  <div>
                    <img src="../tutorial_recipient_image/contactpantry.png" alt="Contact Pantry Staff" />
                  </div>
                </Slider>
              </div>
            </div>

            <h3>Map</h3>
            <div className="use-case-container">
              <div className="use-case-text">
                <ul>
                  <li>Scenario: Locating and understanding the layout of the pantry</li>
                  <li>Steps:
                    <ol>
                      <li>Navigate to the Map page</li>
                      <li>Familiarize yourself with the pantry map and storage areas</li>
                      <li>Visit the pantry and quickly grab the items you need using the map as a guide</li>
                    </ol>
                  </li>
                </ul>
              </div>
             
                  <div>
                    <img src="../tutorial_recipient_image/map.png" alt="Pantry Map" />
                  </div>
                 
             
            </div>
          </div>
        </section>

        <section id="tutorial-recipient-tips">
          <h2>Tips for Maximizing Your Experience</h2>
          <div className="tutorial-section-content">
            <ul>
              <li>Stay Updated: Regularly check your dashboard for new items or announcements</li>
              <li>Plan Ahead: Submit requests early to ensure your items are available</li>
              <li>Use Notifications: Enable notifications to receive real-time updates about your requests and events</li>
              <li>Leverage Recipes: Use the Recipe Idea feature to make the most of the items you receive</li>
            </ul>
          </div>
        </section>

        <section id="tutorial-recipient-help">
          <h2>Need Help?</h2>
          <div className="tutorial-section-content">
            <p>If you encounter any issues or need assistance:</p>
            <ul>
              <li>Send an email to <a href="mailto:pantryhelper.24@gmail.com">pantryhelper.24@gmail.com</a></li>
              <li>Reach out to pantry staff through the Contact Pantry feature</li>
              <li>Check the Help section for answers to common questions</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TutorialRecipient;
