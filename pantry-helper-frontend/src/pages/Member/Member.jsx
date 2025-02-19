import React, { useEffect, useState } from 'react';
import { fetchPantryUsersWithProfiles, deletePantryUser, updateUserAuthority } from '../../services/pantryUserService';
import { Table, Button, Alert, Spin, Input, Modal, message } from 'antd';
import { useProfile } from '../../context/ProfileContext';
import { DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import './Member.css';

const Member = () => {
  const { profile } = useProfile();
  const [staffList, setStaffList] = useState([]);
  const [subscriberList, setSubscriberList] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedStaffKeys, setSelectedStaffKeys] = useState([]);
  const [selectedSubscriberKeys, setSelectedSubscriberKeys] = useState([]);
  const [searchStaffTerm, setSearchStaffTerm] = useState('');
  const [searchSubscriberTerm, setSearchSubscriberTerm] = useState('');

  useEffect(() => {
    fetchMembers();
  }, [profile?.currentPantry]);

  const fetchMembers = async () => {
    if (!profile?.currentPantry) return;

    setLoading(true);
    try {
      const response = await fetchPantryUsersWithProfiles(profile.currentPantry);
      const pantryUsers = response.data;

      const staff = pantryUsers.filter(user => user.userAuthority === 'staff');
      const subscribers = pantryUsers.filter(user => user.userAuthority === 'recipient');

      setStaffList(staff);
      setSubscriberList(subscribers);
    } catch (err) {
      console.error('Error fetching pantry users with profiles:', err);
      setError('Failed to load members.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (profileId) => {
    Modal.confirm({
      title: 'Are you sure you want to remove this member?',
      onOk: async () => {
        try {
          await deletePantryUser(profileId, profile.currentPantry);
          message.success('Member removed successfully');
          fetchMembers();
        } catch (error) {
          console.error('Error removing member:', error);
          message.error('Failed to remove member');
        }
      }
    });
  };

  const handleDeleteSelected = async (members) => {
    Modal.confirm({
      title: `Are you sure you want to remove ${members.length} members?`,
      onOk: async () => {
        try {
          const deletePromises = members.map(profileId => 
            deletePantryUser(profileId, profile.currentPantry)
          );
          
          await Promise.all(deletePromises);
          setSelectedStaffKeys([]);
          setSelectedSubscriberKeys([]);
          fetchMembers();
          message.success('Selected members removed successfully');
        } catch (error) {
          console.error('Error removing members:', error);
          message.error('Failed to remove selected members');
        }
      }
    });
  };

  const handleUpdateAuthority = async (profileId, newAuthority) => {
    try {
      await updateUserAuthority(profileId, profile.currentPantry, newAuthority);
      message.success('User authority updated successfully');
      fetchMembers();
    } catch (error) {
      console.error('Error updating user authority:', error);
      message.error('Failed to update user authority');
    }
  };

  const getFilteredStaffList = () => {
    return staffList.filter(staff =>
      staff.name.toLowerCase().includes(searchStaffTerm.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchStaffTerm.toLowerCase())
    );
  };

  const getFilteredSubscriberList = () => {
    return subscriberList.filter(subscriber =>
      subscriber.name.toLowerCase().includes(searchSubscriberTerm.toLowerCase()) ||
      subscriber.email.toLowerCase().includes(searchSubscriberTerm.toLowerCase())
    );
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name)
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: (a, b) => a.email.localeCompare(b.email)
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <DeleteOutlined
          className="action-icon delete-icon"
          onClick={() => handleDelete(record.profileID)}
        />
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
  
    </div>
    );
  }

  if (error) {
    return (
      <div id="members-container">
        <Alert message="Error" description={error} type="error" showIcon />
      </div>
    );
  }

  return (
    <div id="members-container">
      <div id="members-tables-container">
        {/* Staff Table */}
        <div id="staff-table">
          <div id="staff-header">
            <div className="member-header-left">
              <Input
                placeholder="Search staff"
                prefix={<SearchOutlined />}
                value={searchStaffTerm}
                onChange={(e) => setSearchStaffTerm(e.target.value)}
                style={{ width: 200 }}
              />
            </div>
            <div className="member-header-right">
              {selectedStaffKeys.length > 0 && (
                <Button
                  id="staff-delete-button"
                  onClick={() => handleDeleteSelected(selectedStaffKeys)}
                >
                  Delete ({selectedStaffKeys.length})
                </Button>
              )}
            </div>
          </div>
          <h4>Staffs</h4>
          <Table
            columns={columns}
            dataSource={getFilteredStaffList()}
            rowKey="profileID"
            pagination={{ 
              pageSize: 8,
              position: ['bottomCenter'],
              showSizeChanger: false
            }}
            rowSelection={{
              selectedRowKeys: selectedStaffKeys,
              onChange: (selectedKeys) => setSelectedStaffKeys(selectedKeys),
            }}
          />
        </div>

        {/* Subscriber Table */}
        <div id="subscriber-table">
          <div id="subscriber-header">
            <div className="member-header-left">
              <Input
                placeholder="Search subscribers"
                prefix={<SearchOutlined />}
                value={searchSubscriberTerm}
                onChange={(e) => setSearchSubscriberTerm(e.target.value)}
                style={{ width: 200 }}
              />
            </div>
            <div className="member-header-right">
              {selectedSubscriberKeys.length > 0 && (
                <Button
                  id="subscriber-delete-button"
                  onClick={() => handleDeleteSelected(selectedSubscriberKeys)}
                >
                  Delete ({selectedSubscriberKeys.length})
                </Button>
              )}
            </div>
          </div>
          <h4>Recipients</h4>
          <Table
            columns={columns}
            dataSource={getFilteredSubscriberList()}
            rowKey="profileID"
            pagination={{ 
              pageSize: 8,
              position: ['bottomCenter'],
              showSizeChanger: false
            }}
            rowSelection={{
              selectedRowKeys: selectedSubscriberKeys,
              onChange: (selectedKeys) => setSelectedSubscriberKeys(selectedKeys),
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Member;
