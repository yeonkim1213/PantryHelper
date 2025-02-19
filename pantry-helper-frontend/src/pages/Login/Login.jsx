// Login.jsx
import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { useProfile } from '../../context/ProfileContext';
import { deleteProfile, updateProfile } from '../../services/profileService';
import { fetchPantries } from '../../services/pantryService';
import { getUserSubscriptions, addPantryUser, deletePantryUser, updateUserAuthority } from '../../services/pantryUserService';
import { verifyPantry } from '../../services/pantryService';
import './Login.css';
import emailjs from 'emailjs-com';
import axios from 'axios';
import { message, Modal } from 'antd';

const Login = () => {
    const {
        profile,
        setProfile,
        login,
        logOut,
        emailNotifications,
        updateEmailNotifications,
    } = useProfile();

    const [pantries, setPantries] = useState([]);
    const [userSubscriptions, setUserSubscriptions] = useState([]);
    const [currentView, setCurrentView] = useState('loginOptions');
    const [accessCode, setAccessCode] = useState('');
    const [selectedPantry, setSelectedPantry] = useState(null);
    const [requestData, setRequestData] = useState({ name: '', email: '', pantryName: '' });
    const [searchTerm, setSearchTerm] = useState('');

    // New state variables for handling staff login
    const [staffLoginPending, setStaffLoginPending] = useState(false);
    const [pendingPantryID, setPendingPantryID] = useState(null);

    const [showRequestForm, setShowRequestForm] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetchPantries();
                const formattedPantries = res.data.map(pantry => ({
                    value: pantry.pantryID,
                    label: pantry.name,
                }));
                setPantries(formattedPantries);
            } catch (err) {
                console.error('Error fetching pantries:', err);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        // If a user is logged in, set the view to 'profile'
        if (profile && profile.profileID) {
            setCurrentView('profile');
            localStorage.setItem('currentView', 'profile');
        }
    }, [profile]);

    useEffect(() => {
        const fetchSubscriptions = async () => {
            if (profile && profile.profileID) {
                try {
                    const response = await getUserSubscriptions(profile.profileID);
                    const subscriptions = response.data || [];
                    setUserSubscriptions(subscriptions);
                } catch (err) {
                    console.error('Error fetching subscriptions:', err);
                    setUserSubscriptions([]);
                }
            }
        };
        fetchSubscriptions();
    }, [profile]);

    // New useEffect to handle staff login after profile is updated
    useEffect(() => {
        if (staffLoginPending && profile && profile.profileID && pendingPantryID) {
            const assignStaff = async () => {
                try {
                    await addPantryUser(profile.profileID, pendingPantryID, 'staff');
                    setProfile(prevProfile => ({
                        ...prevProfile,
                        userAuthority: 'staff',
                        pantryID: pendingPantryID,
                    }));
                    alert('Access code verified successfully. Redirecting to staff profile...');
                    setCurrentView('profile'); // Redirect to profile view
                    localStorage.setItem('currentView', 'profile');
                } catch (error) {
                    console.error('Error adding staff:', error);
                    alert('Failed to assign staff role.');
                } finally {
                    setStaffLoginPending(false);
                    setPendingPantryID(null);
                }
            };

            assignStaff();
        }
    }, [staffLoginPending, profile, pendingPantryID]);

    const handleDeleteProfile = async () => {
        Modal.confirm({
            title: 'Delete Profile',
            content: 'Are you sure you want to delete your profile? This action cannot be undone.',
            okText: 'Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    await deleteProfile(profile.profileID);
                    setProfile(null);
                    logOut();
                    message.success('Profile deleted successfully');
                    setCurrentView('loginOptions');
                    localStorage.setItem('currentView', 'loginOptions');
                } catch (error) {
                    console.error('Error deleting profile:', error);
                    message.error('Failed to delete profile.');
                }
            },
        });
    };

    const handleEmailNotificationChange = async () => {
        const newStatus = !emailNotifications;
        updateEmailNotifications(newStatus);
        try {
            await updateProfile(profile.profileID, {
                name: profile.name,
                emailPreference: newStatus,
                userAuthority: profile.userAuthority,
                pantryID: profile.pantryID,
            });
        } catch (error) {
            console.error('Error updating email preference:', error);
        }
    };

    const handleLoginAsRecipient = async () => {
        try {
            await login();
            // alert('Logged in successfully');
            setCurrentView('profile');
            localStorage.setItem('currentView', 'profile');
        } catch (error) {
            console.error('Error logging in as user:', error);
        }
    };

    const handleLoginAsStaff = () => {
        setCurrentView('staffLogin');
        localStorage.setItem('currentView', 'staffLogin');
    };

    const handleAccessCodeSubmit = async (e) => {
        e.preventDefault();
        if (!selectedPantry || !accessCode) {
          alert('Please select a pantry and enter the access code.');
          return;
        }
      
        try {
          const res = await verifyPantry(accessCode, selectedPantry.value);
          
          // Update user's role to staff
          await updateUserAuthority(profile.profileID, res.data.pantryID, 'staff');
          
          // Update local profile state
          setProfile(prevProfile => ({
            ...prevProfile,
            userAuthority: 'staff',
            pantryID: res.data.pantryID,
          }));
      
          alert('Access code verified successfully.');
          setCurrentView('profile');
        } catch (error) {
          console.error('Error verifying access code:', error);
          alert('Failed to verify access code: ' + (error.response ? error.response.data.error : error.message));
        }
      };
      
    const handleSubscribe = async (pantry) => {
        if (userSubscriptions.some((sub) => sub.pantryID === pantry.value)) {
            alert(`You are already subscribed to ${pantry.label}`);
            return;
        }
        try {
            await addPantryUser(profile.profileID, pantry.value, 'recipient');
            
            // Update userSubscriptions immediately
            setUserSubscriptions((prevSubscriptions) => [
                ...prevSubscriptions,
                { pantryID: pantry.value, pantryName: pantry.label, userAuthority: 'recipient' }
            ]);
    
            alert(`Subscribed to ${pantry.label} successfully`);
            window.location.reload();
        } catch (error) {
            console.error('Error adding subscription:', error);
            alert('Failed to subscribe to pantry.');
        }
    };
    
    const handleUnsubscribe = async (pantry) => {
        try {
            await deletePantryUser(profile.profileID, pantry.value);
    
            // Update userSubscriptions immediately
            setUserSubscriptions((prevSubscriptions) =>
                prevSubscriptions.filter((sub) => sub.pantryID !== pantry.value)
            );
    
            alert(`Unsubscribed from ${pantry.label} successfully`);
            window.location.reload();
        } catch (error) {
            console.error('Error deleting subscription:', error);
            alert('Failed to unsubscribe from pantry.');
        }
    };

    const handleLogOut = () => {
        logOut();
        setCurrentView('loginOptions');
        localStorage.setItem('currentView', 'loginOptions');
    };

    const handleManageSubscriptions = () => {
        setCurrentView('manageSubscriptions');
        localStorage.setItem('currentView', 'manageSubscriptions');
    };

    const handleRequestPantryChange = (e) => {
        const { name, value } = e.target;
        setRequestData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmitRequestPantry = async () => {
        if (!requestData.name || !requestData.email || !requestData.pantryName) {
            message.error('Please fill in all fields');
            return;
        }

        const emailBody = `Dear Administrator,

We have received a new pantry request from a user.

Here are the details of the request:

Requestor Name: ${requestData.name}
Email Address: ${requestData.email}
Pantry Name: ${requestData.pantryName}

Please review this request and take the necessary steps to evaluate and set up the new pantry if approved. Feel free to reach out to the requestor for additional information or clarification as needed.

Thank you for your attention to this request.

Best regards,
Pantry Helper`;

        const templateParams = {
            to_email: 'pantryhelper.24@gmail.com',
            subject: 'New Pantry Request - ' + requestData.pantryName,
            body: emailBody
        };

        try {
            await emailjs.send(
                'service_wo51ay6',
                'template_2cqmv5d',
                templateParams,
                '-MdM8ZuwbQfpJzecS'
            );
            
            message.success('Pantry request submitted successfully! We will contact you within 5 business days.');
            setRequestData({ name: '', email: '', pantryName: '' });
            setShowRequestForm(false);
        } catch (error) {
            console.error('Error sending request:', error);
            message.error('Failed to submit pantry request. Please try again.');
        }
    };

    const handleRequestNewPantry = () => {
        setCurrentView('requestPantry');
        localStorage.setItem('currentView', 'requestPantry');
    };

    return (
        <div className="login-container">
            {currentView === 'loginOptions' ? (
                <div className="card login-card">
                    <h3>Welcome to Pantry Helper!</h3>
                    <button onClick={handleLoginAsRecipient} id="login-recipient-button">
                        
                        <span>Login with Google Account</span>
                    </button>
                </div>
            ) : currentView === 'profile' ? (
                profile ? (
                    <div className="card profile-card">
                        <div className="profile-header">
                            <h3>Your Profile</h3>
                            <button onClick={handleLogOut} className="logout-button">Log out</button>
                        </div>
                        <div className="profile-content">
                            <div className="profile-info">
                                <img 
                                    src={profile.picture || '/sidebar_icons/login.png'} 
                                    alt="profile" 
                                    className="profile-picture"
                                    onError={(e) => {
                                        e.target.onerror = null; // Prevent infinite loop
                                        e.target.src = '/sidebar_icons/login.png';
                                    }}
                                />
                                <div className="profile-details">
                                    <p><strong>Name:</strong> {profile.name}</p>
                                    <p><strong>Email:</strong> {profile.email}</p>
                                    <div className="notification-toggle">
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={emailNotifications}
                                                onChange={handleEmailNotificationChange}
                                            />
                                            Email Notifications
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="pantry-section">
                                <div className="pantry-header">
                                    <h4>Subscribed Pantries</h4>
                                    <div className="pantry-actions">
                                        <button onClick={() => setCurrentView('staffLogin')} className="register-staff-link">
                                            Register as a pantry staff
                                        </button>
                                        <button onClick={() => setCurrentView('manageSubscriptions')} className="manage-subscriptions-button">
                                            Manage Subscriptions
                                        </button>
                                    </div>
                                </div>
                                
                                <table className="pantry-table">
                                    <thead>
                                        <tr>
                                            <th>Pantry Name</th>
                                            <th>User Authority</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {userSubscriptions
                                            .sort((a, b) => {
                                                const pantryA = pantries.find(p => p.value === a.pantryID)?.label || '';
                                                const pantryB = pantries.find(p => p.value === b.pantryID)?.label || '';
                                                return pantryA.localeCompare(pantryB);
                                            })
                                            .map((sub, index) => {
                                                const pantry = pantries.find(p => p.value === sub.pantryID);
                                                return (
                                                    <tr key={index}>
                                                        <td>{pantry ? pantry.label : 'Unknown Pantry'}</td>
                                                        <td>{sub.userAuthority}</td>
                                                    </tr>
                                                );
                                            })}
                                    </tbody>
                                </table>

                                <div className="profile-footer">
                                    <span onClick={handleDeleteProfile} className="delete-profile-link">
                                        Delete Profile
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="loading-container">
                        <div className="loader"></div>
                    </div>
                )
            ) : currentView === 'manageSubscriptions' ? (
                <div className="card manage-subscriptions">
                    <button onClick={() => setCurrentView('profile')} className="back-button">
                        ← Back
                    </button>
                    <h3>Manage Your Pantry Subscriptions</h3>
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Search pantries..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <ul>
                        {pantries
                            .sort((a, b) => a.label.localeCompare(b.label))
                            .filter(pantry => pantry.label.toLowerCase().includes(searchTerm.toLowerCase()))
                            .map((pantry) => {
                                const subscription = userSubscriptions.find(
                                    (sub) => sub.pantryID === pantry.value
                                );
                                const isSubscribed = !!subscription;
                                const isStaffOrAdmin = subscription?.userAuthority === 'staff' || 
                                                     subscription?.userAuthority === 'admin';

                                return (
                                    <li key={pantry.value} className="subscription-item">
                                        <span>{pantry.label}</span>
                                        {isStaffOrAdmin ? (
                                            <button 
                                                className="role-button"
                                                disabled
                                            >
                                                {subscription.userAuthority}
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => isSubscribed ? 
                                                    handleUnsubscribe(pantry) : 
                                                    handleSubscribe(pantry)}
                                                className={isSubscribed ? 'unsubscribe-button' : 'subscribe-button'}
                                            >
                                                {isSubscribed ? 'Unsubscribe' : 'Subscribe'}
                                            </button>
                                        )}
                                    </li>
                                );
                            })}
                    </ul>
                </div>
            ) : currentView === 'staffLogin' ? (
                <div className="staff-login-container">
                    <div className="card staff-login">
                        <button onClick={() => setCurrentView('profile')} className="back-button">
                            ← Back
                        </button>
                        <h3>Pantry Staff Login</h3>
                        <div className="form-group">
                            <label>Select Pantry:</label>
                            <Select
                                options={[...pantries].sort((a, b) => a.label.localeCompare(b.label))}
                                value={selectedPantry}
                                onChange={setSelectedPantry}
                                isClearable
                                className="select-container"
                            />
                        </div>
                        <div className="form-group">
                            <label>Access Code:</label>
                            <input
                                type="password"
                                value={accessCode}
                                onChange={(e) => setAccessCode(e.target.value)}
                            />
                        </div>
                        <div className="submit-button-container">
                            <button onClick={handleAccessCodeSubmit} className="submit-button">Submit</button>
                        </div>
                        
                        <div className="request-link">
                            Don't see your pantry?{' '}
                            <span 
                                onClick={() => setShowRequestForm(!showRequestForm)} 
                                className="link-text"
                            >
                                Request a new pantry
                            </span>
                        </div>
                    </div>

                    {showRequestForm && (
                        <div className="card request-form">
                            <h3>Request Your Pantry!</h3>
                            <div className="form-group">
                                <label>Name:</label>
                                <input
                                    type="text"
                                    value={requestData.name}
                                    onChange={(e) => setRequestData({...requestData, name: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>Email:</label>
                                <input
                                    type="email"
                                    value={requestData.email}
                                    onChange={(e) => setRequestData({...requestData, email: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>Pantry Name:</label>
                                <input
                                    type="text"
                                    value={requestData.pantryName}
                                    onChange={(e) => setRequestData({...requestData, pantryName: e.target.value})}
                                />
                            </div>
                            <p className="info-text">We will contact you within 5 business days</p>
                            <div className="submit-button-container">
                                <button onClick={handleSubmitRequestPantry} className="submit-button">
                                    Submit
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ) : currentView === 'requestPantry' ? (
                <div id="request-pantry-modal">
                    <div className="modal-content">
                        <h3>Request Your Pantry!</h3>
                        <div className="form-group">
                            <label>Name:</label>
                            <input
                                type="text"
                                value={requestData.name}
                                onChange={(e) => setRequestData({
                                    ...requestData,
                                    name: e.target.value
                                })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Email:</label>
                            <input
                                type="email"
                                value={requestData.email}
                                onChange={(e) => setRequestData({
                                    ...requestData,
                                    email: e.target.value
                                })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Pantry Name:</label>
                            <input
                                type="text"
                                value={requestData.pantryName}
                                onChange={(e) => setRequestData({
                                    ...requestData,
                                    pantryName: e.target.value
                                })}
                            />
                        </div>
                        <p className="info-text">We will contact you within 5 business days</p>
                        <div className="submit-button-container">
                            <button 
                                onClick={handleSubmitRequestPantry}
                                className="submit-button"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default Login;