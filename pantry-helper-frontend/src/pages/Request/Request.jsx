import React, { useState, useEffect } from 'react';
import { useProfile } from '../../context/ProfileContext';
import { 
  getRequestsByPantryID, 
  deleteRequest,
  addRequest,
  updateRequest
} from '../../services/requestService';
import { 
  Input, 
  Select, 
  Button, 
  Checkbox, 
  Space, 
  Table, 
  Modal,
  message, Form
} from 'antd';
import { 
  SearchOutlined, 
  EditOutlined, 
  DeleteOutlined 
} from '@ant-design/icons';
import moment from 'moment';
import './Request.css';

const { Option } = Select;

const Request = () => {
  const { profile } = useProfile();
  const [loading, setLoading] = useState(false);
  const [existingRequests, setExistingRequests] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(moment().month());
  const [selectedYear, setSelectedYear] = useState(moment().year());
  const [includeCompleted, setIncludeCompleted] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [isRequestModalVisible, setIsRequestModalVisible] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newQuantity, setNewQuantity] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const currentYear = moment().year();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  useEffect(() => {
    if (profile?.currentPantry) {
      fetchRequests();
    }
  }, [profile?.currentPantry]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await getRequestsByPantryID(profile.currentPantry);
      const requests = response.data;
      setExistingRequests(requests);
      filterRequests(searchText, selectedMonth, selectedYear, includeCompleted, requests);
    } catch (error) {
      console.error('Error fetching requests:', error);
      message.error('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
    filterRequests(value, selectedMonth, selectedYear, includeCompleted, existingRequests);
  };

  const handleMonthChange = (value) => {
    setSelectedMonth(value);
    filterRequests(searchText, value, selectedYear, includeCompleted, existingRequests);
  };

  const handleYearChange = (value) => {
    setSelectedYear(value);
    filterRequests(searchText, selectedMonth, value, includeCompleted, existingRequests);
  };

  const handleIncludeCompleted = (e) => {
    setIncludeCompleted(e.target.checked);
    filterRequests(searchText, selectedMonth, selectedYear, e.target.checked, existingRequests);
  };

  const customSorter = (a, b) => {
    if (includeCompleted) {
      if (a.completed !== b.completed) {
        return b.completed ? 1 : -1;
      }
    }
    
    const dateComparison = moment(a.requestDate).unix() - moment(b.requestDate).unix();
    
    if (dateComparison === 0) {
      return a.itemName.localeCompare(b.itemName);
    }
    
    return dateComparison;
  };

  const filterRequests = (search, month, year, showCompleted, requests) => {
    let filtered = [...(requests || existingRequests)];

    filtered = filtered.filter(request => request.profileID === profile.profileID);

    if (search) {
      filtered = filtered.filter(request => 
        request.itemName.toLowerCase().includes(search.toLowerCase())
      );
    }

    filtered = filtered.filter(request => {
      const requestDate = moment(request.requestDate);
      return requestDate.month() === month && requestDate.year() === year;
    });

    if (!showCompleted) {
      filtered = filtered.filter(request => !request.completed);
    }

    filtered.sort(customSorter);

    setFilteredRequests(filtered);
  };

  const handleDeleteSelected = async () => {
    const completedRequests = selectedRows.filter(key => 
      filteredRequests.find(r => `${r.profileID}-${r.itemName}` === key)?.completed
    );

    if (completedRequests.length > 0) {
      message.error('Cannot delete completed requests');
      return;
    }

    Modal.confirm({
      title: 'Delete Selected Requests',
      content: 'Are you sure you want to delete the selected requests?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          for (const key of selectedRows) {
            const [profileID, itemName] = key.split('-');
            await deleteRequest(profileID, profile.currentPantry, itemName);
          }
          
          const remainingItems = filteredRequests.length - selectedRows.length;
          const newLastPage = Math.ceil(remainingItems / 8);
          if (currentPage > newLastPage) {
            setCurrentPage(Math.max(1, newLastPage));
          }
          
          message.success('Selected requests deleted successfully');
          setSelectedRows([]);
          await fetchRequests();
        } catch (error) {
          console.error('Error deleting selected requests:', error);
          message.error('Failed to delete selected requests');
        }
      }
    });
  };

  const handleEdit = (record) => {
    let newQuantity = record.quantity;
    let newItemName = record.itemName;
    
    Modal.confirm({
      title: 'Edit Request',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Input
            defaultValue={record.itemName}
            onChange={(e) => {
              newItemName = e.target.value;
            }}
            placeholder="Enter new item name"
          />
          <Input
            type="number"
            defaultValue={record.quantity}
            onChange={(e) => {
              newQuantity = parseInt(e.target.value);
            }}
            placeholder="Enter new quantity"
          />
        </div>
      ),
      onOk: async () => {
        try {
          const updates = {};
          if (newItemName !== record.itemName) updates.newItemName = newItemName;
          if (newQuantity !== record.quantity) updates.newQuantity = newQuantity;

          if (Object.keys(updates).length === 0) {
            message.info('No changes made');
            return;
          }

          await updateRequest(
            record.profileID,
            profile.currentPantry,
            record.itemName,
            updates
          );

          message.success('Request updated successfully');
          await fetchRequests();
          setCurrentPage(currentPage);
        } catch (error) {
          console.error('Error updating request:', error);
          message.error('Failed to update request');
        }
      }
    });
  };

  const handleDelete = (record) => {
    if (record.completed) {
      message.error('Cannot delete completed requests');
      return;
    }

    Modal.confirm({
      title: 'Delete Request',
      content: 'Are you sure you want to delete this request?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await deleteRequest(record.profileID, profile.currentPantry, record.itemName);
          message.success('Request deleted successfully');
          
          const itemsInCurrentPage = filteredRequests.length % 8;
          if (itemsInCurrentPage === 1 && currentPage > 1) {
            setCurrentPage(currentPage - 1);
          }
          
          await fetchRequests();
        } catch (error) {
          console.error('Error deleting request:', error);
          message.error('Failed to delete request');
        }
      }
    });
  };

  const handleRequestModalOpen = () => {
    setIsRequestModalVisible(true);
    setNewItemName('');
    setNewQuantity(1);
  };

  const handleRequestModalClose = () => {
    setIsRequestModalVisible(false);
  };

  const checkExistingRequest = (itemName) => {
    return existingRequests.some(request => 
      request.profileID === profile.profileID && 
      request.itemName.toLowerCase() === itemName.toLowerCase() &&
      !request.completed
    );
  };

  const handleRequestSubmit = async () => {
    try {
      if (!newItemName.trim()) {
        message.error('Please enter an item name');
        return;
      }

      if (!newQuantity || newQuantity < 1) {
        message.error('Please enter a valid quantity');
        return;
      }

      if (checkExistingRequest(newItemName.trim())) {
        message.error('You have already requested this item');
        return;
      }

      await addRequest({
        profileID: profile.profileID,
        pantryID: profile.currentPantry,
        itemName: newItemName.trim(),
        quantity: newQuantity,
        requestDate: moment().format('YYYY-MM-DD'),
        completed: false
      });

      message.success('Request added successfully');
      handleRequestModalClose();
      fetchRequests();
    } catch (error) {
      if (error.response?.data?.error) {
        message.error(error.response.data.error);
      } else {
        console.error('Error adding request:', error);
        message.error('Failed to add request');
      }
    }
  };

  const columns = [
    {
      title: 'Item Name',
      dataIndex: 'itemName',
      sorter: (a, b) => a.itemName.localeCompare(b.itemName),
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      sorter: (a, b) => a.quantity - b.quantity,
    },
    {
      title: 'Request Date',
      dataIndex: 'requestDate',
      render: (date) => moment(date).format('MM/DD/YYYY'),
      sorter: (a, b) => moment(a.requestDate).unix() - moment(b.requestDate).unix(),
    },
    {
      title: 'Completed',
      dataIndex: 'completed',
      render: (completed) => completed ? 'Yes' : 'No',
      sorter: (a, b) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size='middle'>
          <EditOutlined
            className={`action-icon edit-icon ${record.completed ? 'disabled-icon' : ''}`}
            onClick={() => !record.completed && handleEdit(record)}
          />
          <DeleteOutlined
            className={`action-icon delete-icon ${record.completed ? 'disabled-icon' : ''}`}
            onClick={() => !record.completed && handleDelete(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="request-container">
      <div className="request-content">
        {/* Left side - Welcome Message */}
        <div id="request-welcome-section">
          <h2>Hi, {profile?.name}!</h2>
          <p>Can't find what you need?</p>
          <p>Don't worry, we're here to help!</p>
          <p>Just let us know what you're looking for, and we'll do our best to get it added to the pantry.</p>
          <p>Go ahead and make a request.</p>
          <p>Thank you!</p>
        </div>

        {/* Right side - Request Table */}
        <div className="table-section">
          <div className="request-header">
            <div className="request-header-left">
              <Space>
                <Input 
                  placeholder="Search"
                  prefix={<SearchOutlined />}
                  onChange={(e) => handleSearch(e.target.value)}
                  style={{ width: 120 }}
                />
                <Select
                  value={selectedMonth}
                  onChange={handleMonthChange}
                  style={{ width: 120 }}
                >
                  {months.map((month, index) => (
                    <Option key={index} value={index}>{month}</Option>
                  ))}
                </Select>
                <Select
                  value={selectedYear}
                  onChange={handleYearChange}
                  style={{ width: 100 }}
                >
                  {years.map(year => (
                    <Option key={year} value={year}>{year}</Option>
                  ))}
                </Select>
                <Checkbox 
                  checked={includeCompleted}
                  onChange={handleIncludeCompleted}
                >
                  Include completed
                </Checkbox>
              </Space>
            </div>
            <div className="request-header-right">
              {selectedRows.length > 0 && (
                <Button 
                  danger
                  onClick={handleDeleteSelected}
                  style={{ width: 100 }}
                >
                  Delete ({selectedRows.length})
                </Button>
              )}
              <Button type="primary" onClick={handleRequestModalOpen}>
                Request
              </Button>
            </div>
          </div>

          <Table
            id="request-table"
           
            rowSelection={{
              selectedRowKeys: selectedRows,
              onChange: (selectedKeys, selectedRows) => {
                setSelectedRows(selectedKeys);
              },
              getCheckboxProps: record => ({
                disabled: record.completed,
                name: record.itemName,
              })
            }}
            columns={columns}
            dataSource={filteredRequests.sort(customSorter)}
            rowKey={(record) => `${record.profileID}-${record.itemName}`}
            pagination={{
              current: currentPage,
              pageSize: 8,
              total: filteredRequests.length,
              position: ['bottomCenter'],
              showSizeChanger: false,
              onChange: (page) => {
                setCurrentPage(page);
                setSelectedRows([]);
              }
            }}
            bordered
          />
        </div>
      </div>

      {/* Request Modal */}
      <Modal
        title="New Request"
        visible={isRequestModalVisible}
        onCancel={handleRequestModalClose}
        footer={null}
      >
        <Form onFinish={handleRequestSubmit} layout="vertical">
          <Form.Item
            name="itemName"
            label="Item Name"
            rules={[{ required: true, message: 'Please enter item name' }]}
          >
            <Input 
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Enter item name"
            />
          </Form.Item>
          <Form.Item
            name="quantity"
            label="Quantity"
            rules={[{ required: true, message: 'Please enter quantity' }]}
          >
            <Input
              type="number"
              min={1}
              value={newQuantity}
              onChange={(e) => setNewQuantity(parseInt(e.target.value) || '')}
              placeholder="Enter quantity"
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Submit Request
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Request;
