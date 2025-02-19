import React, { useEffect, useState } from 'react';
import { useProfile } from '../../context/ProfileContext';
import { fetchPantryUsers } from '../../services/pantryUserService';
import DashboardStaff from './components/DashboardStaff';
import DashboardRecipient from './components/DashboardRecipient';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const Dashboard = () => {
  const { profile } = useProfile();
  const [userAuthority, setUserAuthority] = useState('');

  

  useEffect(() => {
    const fetchUserAuthority = async () => {
      if (!profile || !profile.currentPantry) {
        return;
      }
      try {
        const response = await fetchPantryUsers();
        const pantryUsers = response.data;
        const currentAuthority = pantryUsers.find(
          (user) =>
            user.profileID === profile.profileID &&
            user.pantryID === profile.currentPantry
        )?.userAuthority;
        setUserAuthority(currentAuthority || 'recipient');
      } catch (error) {
        console.error('Error fetching pantry users:', error);
      }
    };
    fetchUserAuthority();
  }, [profile]);

  if (!profile) {
    return (
      <div className="loading-container">
     
      </div>
    );
  }

  return (
    <>
      {userAuthority === 'staff' || userAuthority === 'admin' ? (
        <DashboardStaff />
      ) : (
        <DashboardRecipient />
      )}
    </>
  );
};

export default Dashboard;
