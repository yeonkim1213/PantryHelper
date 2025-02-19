import React, { useState, useEffect } from 'react';
import './Sidebar.css';
import { Link, useLocation } from 'react-router-dom';
import { useProfile } from '../../context/ProfileContext';
import { getUserSubscriptions } from '../../services/pantryUserService';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const Sidebar = ({setSidebarCollapsed}) => {
  const location = useLocation();
  const { profile } = useProfile();
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState('');
  const [userRole, setUserRole] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (profile?.profileID && profile?.currentPantry) {
        try {
          const response = await getUserSubscriptions(profile.profileID);
          const currentPantryRole = response.data.find(
            sub => sub.pantryID === profile.currentPantry
          );
          setUserRole(currentPantryRole?.userAuthority || 'recipient');
        } catch (error) {
          console.error('Error fetching user role:', error);
          setUserRole('recipient');
        }
      } else {
        setUserRole(null);
      }
    };

    fetchUserRole();
  }, [profile?.profileID, profile?.currentPantry]);

  const scrollToTop = () => {
    window.scrollTo(0, 0);
  };

  const toggleReportsDropdown = () => {
    setIsReportsOpen(prev => !prev);
    setActiveMenuItem(prev => prev === 'report' ? '' : 'report');
  };

  const handleMenuClick = (menu) => {
    setActiveMenuItem(menu);
  };

  const handleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    setSidebarCollapsed(!isCollapsed);
  };

  const isActive = (path) => location.pathname === path;

  const isReportPage = (path) => {
    const reportPaths = ['/report', '/reportpopular', '/reportexpired', '/reportrequested', '/reportfinance'];
    return reportPaths.includes(path);
  };

  const renderMenuItems = () => {
    if (!profile) {
      // Only show login when not logged in
      return (
        <div>
          <div
            className={`menuItem ${isActive('/login') ? 'active' : ''}`}
            onClick={() => handleMenuClick('/login')}
          >
            <img src='/sidebar_icons/login.png' alt='Login' />
            <Link to='/login' onClick={scrollToTop}>
              Log In
            </Link>
          </div>
          <div  
            className={`menuItem ${isActive('/about') ? 'active' : ''}`}
            onClick={() => handleMenuClick('/about')}
          >
            <img src='/sidebar_icons/about.png' alt='About' />
            <Link to='/about' onClick={scrollToTop}>
              About
            </Link>
          </div>
        </div>
      );
    }

    // Menu items for logged-in users
    const menuItems = [
      {
        path: '/login',
        icon: 'login.png',
        text: 'Profile',
        roles: ['all']
      },
      {
        path: '/pantry',
        icon: 'pantry.png',
        text: 'Pantry',
        roles: ['admin']
      },
      {
        path: '/',
        icon: 'dashboard.png',
        text: 'Dashboard',
        roles: ['recipient', 'staff', 'admin']
      },
      {
        path: '/inventory',
        icon: 'inventory.png',
        text: 'Inventory',
        roles: ['recipient', 'staff', 'admin']
      },
      {
        path: '/finance',
        icon: 'finance.png',
        text: 'Finance',
        roles: ['staff', 'admin']
      }
    ];

    const reportPages = [
      { path: '/report', text: 'In & Outgoing Items' },
      { path: '/reportpopular', text: 'Popular Items' },
      { path: '/reportexpired', text: 'Expired Items' },
      { path: '/reportrequested', text: 'Requested Items' },
      { path: '/reportfinance', text: 'Income & Expense' }
    ];

    const remainingItems = [
      {
        path: '/member',
        icon: 'member.png',
        text: 'Member',
        roles: ['staff', 'admin']
      },
      {
        path: '/request',
        icon: 'request.png',
        text: 'Request',
        roles: ['recipient', 'staff', 'admin']
      },
      {
        path: '/event',
        icon: 'event.png',
        text: 'Event',
        roles: ['recipient', 'staff', 'admin']
      },
      {
        path: '/recipe',
        icon: 'recipe.png',
        text: 'Recipe Idea',
        roles: ['recipient', 'staff', 'admin']
      },
      {
        path: '/map',
        icon: 'map.png',
        text: 'Map',
        roles: ['recipient', 'staff', 'admin']
      },
      {
        path: '/contact',
        icon: 'contact_pantry.png',
        text: 'Contact Pantry',
        roles: ['recipient', 'staff', 'admin']
      },
      {
        path: '/help',
        icon: 'help.png',
        text: 'Help',
        roles: ['recipient', 'staff', 'admin']
      },      
      {
        path: '/about',
        icon: 'about.png',
        text: 'About',
        roles: ['recipient', 'staff', 'admin']
      }
    ];

    return (
      <>
      {/* Render main menu items */}
      {menuItems
        .filter(item => item.roles.includes('all') || item.roles.includes(userRole))
        .map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`menuItem ${isActive(item.path) ? 'active' : ''}`} // Ensure active class is applied
            onClick={scrollToTop}
          >
            <img src={`/sidebar_icons/${item.icon}`} alt={item.text} />
            {!isCollapsed && <span>{item.text}</span>}
          </Link>
        ))}
        {/* Render reports section for staff and admin */}
        {(userRole === 'staff' || userRole === 'admin') && (
          <>
            {isCollapsed ? (
              // When collapsed, use Link component to navigate directly
              <Link
                to="/report"
                className={`menuItem ${isActive('/report') ? 'active' : ''}`}
                onClick={scrollToTop}
              >
                <img 
                  src='/sidebar_icons/report.png' 
                  alt='Reports'
                />
              </Link>
            ) : (
              // When expanded, show dropdown toggle
              <div
                className={`menuItem ${activeMenuItem === 'report' ? 'active' : ''}`}
                onClick={toggleReportsDropdown}
                data-is-report="true"
                data-report-active={isReportPage(location.pathname)}
              >
                <img 
                  src='/sidebar_icons/report.png' 
                  alt='Reports'
                />
                <span>Reports</span>
                <img
                  src={`/sidebar_icons/arrow_${isReportsOpen ? 'up' : 'down'}.png`}
                  alt='Arrow'
                  className='arrow-icon'
                />
              </div>
            )}
            {!isCollapsed && isReportsOpen && (
              <div className='dropdown'>
                {reportPages.map(report => (
                  <Link
                    key={report.path}
                    to={report.path}
                    className={`dropdown-item ${isActive(report.path) ? 'active' : ''}`}
                    onClick={scrollToTop}
                  >
                    {report.text}
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
        {/* Render remaining menu items */}
        {remainingItems
          .filter(item => item.roles.includes('all') || item.roles.includes(userRole))
          .map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`menuItem ${isActive(item.path) ? 'active' : ''}`} // Active class for selected item
              onClick={scrollToTop}
            >
              <img src={`/sidebar_icons/${item.icon}`} alt={item.text} />
              {!isCollapsed && <span>{item.text}</span>} {/* Show text only if not collapsed */}
            </Link>
          ))}
      </>
    );
  };

  return (
    <div className='Main'>
      <div className={`Sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        
        <div id="logo-container">
          <Link to='/'>
            {<img src='/sidebar_icons/logo.png' alt='Logo' id='logo-image' />}
            {!isCollapsed && <h1 id='logo-text'>Pantry Helper</h1>}
          </Link>
        </div>
        <button className='collapse-button' onClick={handleCollapse}>
          {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </button>
        <div className='menu'>
          {renderMenuItems()}
        </div>
        
      </div>
    </div>
  );
};

export default Sidebar;
