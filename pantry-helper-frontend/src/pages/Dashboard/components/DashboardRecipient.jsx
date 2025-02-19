import React, { useState, useEffect } from 'react';
import './DashboardRecipient.css';
import { fetchEventsByPantry } from '../../../services/eventService';
import { fetchInventory } from '../../../services/inventoryService';
import moment from 'moment';
import { useProfile } from '../../../context/ProfileContext';
import { Link, useNavigate } from 'react-router-dom';
import { Spin } from 'antd';

const fetchRandomRecipe = async () => {
  try {
    const response = await fetch(
      'https://www.themealdb.com/api/json/v1/1/random.php'
    );
    if (!response.ok) {
      throw new Error('Error fetching random recipe');
    }
    const data = await response.json();
    return data.meals[0];
  } catch (error) {
    console.error('Error fetching random recipe:', error);
    throw error;
  }
};

const DashboardRecipient = () => {
  const [recipe, setRecipe] = useState(null);
  const [events, setEvents] = useState([]);
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const formatIngredient = (ingredient, measure) => {
    return `${ingredient.charAt(0).toUpperCase() + ingredient.slice(1)}: ${measure}`;
  };

  const selectRandomInventoryItems = (items, count = 5) => {
    if (!items || items.length === 0) return [];
    const shuffled = items.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!profile || !profile.currentPantry) {
        return;
      }
      try {
        setLoading(true);
        const [recipeData, inventoryDataRes] = await Promise.all([
          fetchRandomRecipe(),
          fetchInventory(profile.currentPantry),
        ]);
        const fetchedInventoryData = inventoryDataRes.data || [];
        setRecipe(recipeData);
        setInventoryData(fetchedInventoryData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [profile]);

  useEffect(() => {
    const loadEvents = async () => {
      if (!profile || !profile.currentPantry) {
        return;
      }
      try {
        const eventsData = await fetchEventsByPantry(profile.currentPantry);
        if (eventsData && eventsData.data) {
          const allEvents = eventsData.data;
          const upcomingEvents = allEvents
            .filter((event) => moment(event.EventDate).isAfter(moment()))
            .sort((a, b) => moment(a.EventDate).diff(moment(b.EventDate)));
          setEvents(upcomingEvents);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        setError('Failed to load events.');
      }
    };
    loadEvents();
  }, [profile]);

  if (!profile) {
    return (
      <div className="Dashboard">
        <div className="loading-container">
        <Spin tip='Loading records...' />
        </div>
      </div>
    );
  }

  return (
    <div className="Dashboard">
      {error && <div className="error-message">{error}</div>}
      {loading ? (
         <div style={{ textAlign: 'center', padding: '50px' }}>
        
       </div>
      ) : (
        <>
          <div id="dashboard-top-row">
            <div id="welcome-box">
              <div className="welcome-content">
                <div className="welcome-text">
                  <h4>Welcome</h4>
                  <span className="pantry-name">{profile.name || 'Guest'}</span>
                </div>
                <div id="welcome-image-container">
                  <img 
                    src="/dashboard_image/foodTruck.png"
                    alt="Food Truck" 
                    id="welcome-image"
                  />
                </div>
              </div>
            </div>
            <div className="inventory-promotion">
              <div className="inventory-header">
                <h4>Check out these items we have in stock!</h4>
                <Link to="/inventory" className="see-more-button">
                  See more items
                </Link>
              </div>
              {inventoryData && inventoryData.length > 0 ? (
                <>
                  <ul>
                    {selectRandomInventoryItems(inventoryData, 20).map((item, index) => (
                      <li key={index}>{item.Name}</li>
                    ))}
                  </ul>
                  <div id="request-section">
                    <span id="request-text">Looking for something else?</span>
                    <Link to="/request" id="request-link">Request an Item</Link>
                  </div>
                </>
              ) : (
                <p>No items available at the moment.</p>
              )}
            </div>
          </div>

          <div id="dashboard-second-row">
            <div className="today-recipe-container">
              <div className="section-header">
                <h4>Recipe Recommendation</h4>
              </div>
              {recipe && (
                <div className="recipe-layout">
                  <div className="recipe-image-container">
                    <img
                      id="recipe-image"
                      src={recipe.strMealThumb}
                      alt={recipe.strMeal}
                    />
                  </div>
                  <div className="recipe-details">
                    <p>
                      <strong>{recipe.strMeal}</strong>
                    </p>
                    
                    <ul>
                      {[...Array(8).keys()].map((i) => {
                        const ingredient = recipe[`strIngredient${i + 1}`];
                        const measure = recipe[`strMeasure${i + 1}`];
                        return ingredient && ingredient.trim() !== '' ? (
                          <li key={i}>
                            {formatIngredient(ingredient, measure)}
                          </li>
                        ) : null;
                      })}
                    </ul>
                    <a
                      href={recipe.strYoutube}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span>Click here for instructions</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
            <div className="events-section">
              <div className="section-header">
                <h4>Upcoming Events</h4>
                <Link to="/event" className="see-more-button">
                  See more events
                </Link>
              </div>
              {events.length > 0 ? (
                <ul className="event-list">
                  {events.slice(0, 3).map((event) => (
                    <li key={event.id} className="event-item">
                      <img
                        src={event.IconPath}
                        alt={event.EventTitle}
                        className="event-icon"
                      />
                      <div className="event-info">
                        <div className="event-title-row">
                          <Link to="/event" className="event-title">
                            <strong>{event.EventTitle}</strong>
                          </Link>
                          <span className="event-date">
                            {moment(event.EventDate).format('MMMM D, YYYY')}
                          </span>
                        </div>
                        <p>{event.EventDetail}</p>
                        <p>{event.EventLocation}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No upcoming events.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardRecipient;
