import React, { useState, useEffect, useRef } from 'react';
import './Navbar.css';
import { useLocation } from 'react-router-dom';
import Select from 'react-select';
import { useProfile } from '../../context/ProfileContext';
import { getUserSubscriptions } from '../../services/pantryUserService';
import { fetchPantries } from '../../services/pantryService';
import { getProfileById, updateProfile as updateProfileService } from '../../services/profileService';
import { fetchNotifications, deleteNotification, markNotificationAsRead } from '../../services/notificationService';

const Navbar = () => {
  const location = useLocation();
  const { profile, setProfile } = useProfile();
  const [pantryOptions, setPantryOptions] = useState([]);
  const [selectedPantry, setSelectedPantry] = useState(null);
  const [userName, setUserName] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);

  const toggleDropdown = (event) => {
    setIsDropdownOpen((prevState) => {
      const newState = !prevState;
  
      if (newState) {
        markNotificationAsRead(profile.profileID);
      }
  
      return newState;
    });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  const hasUnread = notifications.some((notif) => !notif.isRead);

  useEffect(() => {
    const fetchCurrentPantries = async () => {
      if (profile && profile.profileID) {
        try {
          const response = await getUserSubscriptions(profile.profileID);
          const pantryResponse = await fetchPantries();
          const userResponse = await getProfileById(profile.profileID);

          const userPantries = response.data.map((userPantry) => {
            const matchedPantry = pantryResponse.data.find(
              (pantry) => pantry.pantryID === userPantry.pantryID
            );
            return {
              value: userPantry.pantryID,
              label: matchedPantry ? matchedPantry.name : 'Unknown Pantry',
            };
          }).sort((a, b) => a.label.localeCompare(b.label));

          setPantryOptions(userPantries);

          if (userPantries.length > 0) {
            const currentPantry = userPantries.find(p => p.value === profile.currentPantry);
            if (currentPantry) {
              setSelectedPantry(currentPantry);
            } else {
              const firstPantry = userPantries[0];
              setSelectedPantry(firstPantry);
              handlePantryChange(firstPantry);
            }
          } else {
            setSelectedPantry({ value: '', label: 'Select your pantry' });
          }

          setUserName(userResponse.data.name || profile.name || 'User');
        } catch (error) {
          console.error('Error fetching pantries:', error);
          setUserName(profile.name || 'User');
        }

        if (profile && profile.profileID) {
          try {
            const response = await fetchNotifications(profile.profileID);
            if (response) {
              setNotifications(response);
            }
          } catch (error) {
            console.error('Error fetching notifications:', error);
          }
        }
        
      }
    };

    fetchCurrentPantries();
    
  }, [profile]);

  const handlePantryChange = async (selectedOption) => {
    if (!selectedOption) return;
    
    setSelectedPantry(selectedOption);
    
    try {
      const updatedProfile = {
        ...profile,
        currentPantry: selectedOption.value,
      };
      
      await updateProfileService(profile.profileID, updatedProfile);
      setProfile(updatedProfile);
    } catch (error) {
      console.error('Error updating current pantry:', error);
    }
  };

  const getTitle = (pathname) => {
    switch (pathname) {
      case '/':
        return 'Dashboard';
      case '/inventory':
        return 'Inventory';
      case '/finance':
        return 'Finance';
      case '/recipe':
        return 'Recipe Idea';
      case '/event':
        return 'Event';
      case '/report':
        return 'Incoming & Outgoing Items Report';
      case '/reportpopular':
        return 'Popular Items Report';
      case '/reportexpired':
        return 'Expired Items Report';
      case '/reportrequested':
        return 'Requested Items Report';
      case '/reportfinance':
        return 'Income & Expense Report';
      case '/request':
        return 'Request';
      case '/member':
        return 'Member';
      case '/map':
        return 'Map';
      case '/help':
        return 'Help';
      case '/about':
        return 'About';
      case '/team':
        return 'Meet the Team';
      case '/tutorial':
        return 'Tutorial';
      case '/login':
        return 'Profile';
      case '/pantry':
        return 'Pantry';
      case '/contact':
        return 'Contact Pantry';
      case '/tutorial/recipient':
        return 'Recipient Tutorial';
      case '/tutorial/staff':
        return 'Staff Tutorial';
      case '/tutorial/admin':
        return 'Admin Tutorial';
      default:
        return 'Not Available';
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await deleteNotification(id);

      setNotifications((prevNotifications) =>
        prevNotifications.filter((notif) => notif.notificationID !== id)
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };


  const title = getTitle(location.pathname);

  return (
    <div className='navbar'>
      <div className='navbar-title'>
        <h1>{title}</h1>
      </div>

      {profile && (
        <div className='right-section'>
          <div className='pantry-select'>
            <Select
              id='pantry-dropdown'
              value={selectedPantry}
              options={pantryOptions}
              onChange={handlePantryChange}
              isClearable={false}
              isDisabled={pantryOptions.length === 0}
              placeholder="Select your pantry"
            />
          </div>


          <div className='notifications'>
            <div className='notification-icon' onClick={toggleDropdown}>
              <img
                src={hasUnread ? '/navbar_icons/Bell_with_notification.png' : '/navbar_icons/Bell.png'}
                alt='Notification Icon'
                style={{ width: '32px', height: '32px'}}
              />
            </div>
            {isDropdownOpen && (
              <div
                ref={dropdownRef}
                className='notification-dropdown'
                style={{
                  position: 'absolute',
                  top: '60px',
                  right: '10px',
                  width: '400px',
                  border: '1px solid #ccc',
                  backgroundColor: '#fff',
                  zIndex: 1000,
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                }}
              >
                {notifications.length === 0 ? (
                  <div style={{ padding: '10px', textAlign: 'center' }}>No Notifications</div>
                ) : (
                  <ul>
                    {notifications.map((notif) => (
                      <li
                        key={notif.notificationID}
                        className="notification-item"
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '10px 15px',
                          borderBottom: '1px solid #eee',
                          cursor: 'pointer',
                          transition: 'background-color 0.3s ease',
                        }}
                        onMouseEnter={(e) => (e.target.style.backgroundColor = '#f0f0f0')}
                        onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
                      >
                        <span style={{ marginLeft: '-10px' }}>{notif.detail}</span>
                        <button
                          onClick={() => handleDeleteNotification(notif.notificationID)}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            color: 'red',
                            cursor: 'pointer',
                          }}
                        >
                          X
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div className='userinfo'>
            <p className='userName'>{userName}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
