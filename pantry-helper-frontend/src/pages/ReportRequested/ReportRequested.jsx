import React, { useState, useEffect } from 'react';
import { useProfile } from '../../context/ProfileContext';
import { getRequestsByPantryID, deleteRequest, markRequestCompleted, markRequestIncomplete } from '../../services/requestService';
import { getAllProfiles } from '../../services/profileService';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Select, DatePicker, Row, Col, Table, Button, message, Space, Input, Alert, Spin, Checkbox } from 'antd';
import moment from 'moment';
import './ReportRequested.css';
import { CheckCircleOutlined, SearchOutlined, DeleteOutlined, UndoOutlined } from '@ant-design/icons';
import axios from 'axios';
import { addNotification } from '../../services/notificationService';

const { Option } = Select;
const { RangePicker } = DatePicker;

const months = [
  { name: 'January', value: 0 },
  { name: 'February', value: 1 },
  { name: 'March', value: 2 },
  { name: 'April', value: 3 },
  { name: 'May', value: 4 },
  { name: 'June', value: 5 },
  { name: 'July', value: 6 },
  { name: 'August', value: 7 },
  { name: 'September', value: 8 },
  { name: 'October', value: 9 },
  { name: 'November', value: 10 },
  { name: 'December', value: 11 },
];

const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

const ReportRequested = () => {
  const { profile } = useProfile();
  const [requests, setRequests] = useState([]);
  const [selectedItem, setSelectedItem] = useState('All');
  const [selectedDateRange, setSelectedDateRange] = useState([]);
  const [top10Data, setTop10Data] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [includeCompleted, setIncludeCompleted] = useState(false);
  

  const fetchData = async () => {
    if (profile?.currentPantry) {
      setLoading(true);
      try {
        const [requestsResponse, profilesResponse] = await Promise.all([
          getRequestsByPantryID(profile.currentPantry),
          getAllProfiles()
        ]);

        const profileMap = profilesResponse.data.reduce((acc, profile) => {
          acc[profile.profileID] = {
            name: profile.name,
            email: profile.email
          };
          return acc;
        }, {});

        setProfiles(profileMap);
        setRequests(requestsResponse.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data.');
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [profile?.currentPantry]);

  const processData = () => {
    let filtered = [...requests];
    if (selectedItem !== 'All') {
      filtered = filtered.filter(req => req.itemName === selectedItem);
    }
    if (selectedDateRange.length === 2) {
      const [start, end] = selectedDateRange;
      filtered = filtered.filter(req => {
        const reqDate = moment(req.requestDate);
        return reqDate.isBetween(start.startOf('day'), end.endOf('day'), null, '[]');
      });
    }

    const itemCountMap = {};
    filtered.forEach(req => {
      const item = req.itemName;
      itemCountMap[item] = itemCountMap[item] || { requestCount: 0, users: [] };
      itemCountMap[item].requestCount += 1;
      itemCountMap[item].users.push(req.userName);
    });
    const top10Array = Object.keys(itemCountMap)
      .map(item => ({
        itemName: item,
        requestCount: itemCountMap[item].requestCount,
        users: itemCountMap[item].users,
      }))
      .sort((a, b) => b.requestCount - a.requestCount)
      .slice(0, 10);
    setTop10Data(top10Array);
  };

  const getUniqueItems = () => {
    const items = requests.map(req => req.itemName);
    return ['All', ...Array.from(new Set(items))];
  };

  const handleComplete = async (record) => {
    try {
      await markRequestCompleted(record.profileID, record.pantryID, record.itemName);
      message.success(`Request for "${record.itemName}" marked as completed.`);

      await addNotification({
        profileID: record.profileID,
        pantryID: record.pantryID,
        detail: "Your request has been marked as completed: "+ record.itemName,
        isRead: false,
      });

      fetchData(); // Refresh the data
    } catch (err) {
      console.error('Error marking request as completed:', err);
      message.error('Failed to mark request as completed.');
    }
  };

  const handleDelete = async (record) => {
    try {
      await deleteRequest(record.profileID, record.pantryID, record.itemName);
      message.success(`Request for "${record.itemName}" deleted.`);
      fetchData(); // Refresh the data
    } catch (err) {
      console.error('Error deleting request:', err);
      message.error('Failed to delete request.');
    }
  };

  const handleCompleteSelected = async () => {
    try {
      for (const row of selectedRows) {
        await markRequestCompleted(row.profileID, row.pantryID, row.itemName);
      }
      
      message.success(`${selectedRows.length} requests marked as completed`);
      setSelectedRowKeys([]);
      setSelectedRows([]);
      fetchData();
    } catch (err) {
      console.error('Error completing requests:', err);
      message.error('Failed to complete selected requests');
    }
  };

  const handleRevertComplete = async (record) => {
    try {
      await markRequestIncomplete(record.profileID, record.pantryID, record.itemName);
      message.success(`Request for "${record.itemName}" marked as incomplete.`);
      fetchData();
    } catch (err) {
      console.error('Error reverting request completion:', err);
      message.error('Failed to revert request completion.');
    }
  };

  const columns = [
    { 
      title: 'Item Name', 
      dataIndex: 'itemName', 
      key: 'itemName',
      sorter: (a, b) => a.itemName.localeCompare(b.itemName)
    },
    { 
      title: 'User Name', 
      dataIndex: 'userName', 
      key: 'userName',
      sorter: (a, b) => a.userName.localeCompare(b.userName)
    },
    { 
      title: 'Email', 
      dataIndex: 'email', 
      key: 'email',
      sorter: (a, b) => a.email.localeCompare(b.email)
    },
    { 
      title: 'Quantity', 
      dataIndex: 'quantity', 
      key: 'quantity', 
      sorter: (a, b) => a.quantity - b.quantity 
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size='middle'>
          {record.completed ? (
            <UndoOutlined
              className='action-icon revert-icon'
              onClick={() => handleRevertComplete(record)}
              style={{ color: '#4fc0e3' }}
            />
          ) : (
            <CheckCircleOutlined
              className='action-icon complete-icon'
              onClick={() => handleComplete(record)}
            />
          )}
          <DeleteOutlined
            className='action-icon delete-icon'
            onClick={() => handleDelete(record)}
            style={{ color: '#ff4d4f' }}
          />
        </Space>
      )
    }
  ];

  const paginationConfig = {
    current: currentPage,
    pageSize: pageSize,
    total: requests.length,
    onChange: (page) => setCurrentPage(page),
    showSizeChanger: false,
  };

  const handleSearch = (e) => {
    setSearchText(e.target.value.toLowerCase());
  };

  const handleMonthChange = (value) => {
    setSelectedMonth(value);
  };

  const handleYearChange = (value) => {
    setSelectedYear(value);
  };

  const getFilteredRequests = () => {
    return requests
      .filter(request => {
        const requestDate = moment(request.requestDate);
        const matchesMonth = requestDate.month() === selectedMonth;
        const matchesYear = requestDate.year() === selectedYear;
        const matchesSearch = searchText
          ? request.itemName.toLowerCase().includes(searchText.toLowerCase())
          : true;
        const matchesCompleted = includeCompleted ? true : !request.completed;

        return matchesMonth && matchesYear && matchesSearch && matchesCompleted;
      })
      .map(request => ({
        ...request,
        key: `${request.profileID}-${request.itemName}`,
        userName: profiles[request.profileID]?.name || 'Unknown',
        email: profiles[request.profileID]?.email || 'Unknown'
      }));
  };

  const getChartData = () => {
    const filteredRequests = requests.filter(request => {
      const requestDate = moment(request.requestDate);
      const matchesMonth = requestDate.month() === selectedMonth;
      const matchesYear = requestDate.year() === selectedYear;
      const matchesCompleted = includeCompleted ? true : !request.completed;
      
      return matchesMonth && matchesYear && matchesCompleted;
    });

    const itemCounts = {};
    filteredRequests.forEach(request => {
      if (!itemCounts[request.itemName]) {
        itemCounts[request.itemName] = {
          count: 0,
          requestors: new Set()
        };
      }
      itemCounts[request.itemName].count += 1;
      itemCounts[request.itemName].requestors.add(profiles[request.profileID]?.name || 'Unknown');
    });

    const chartData = Object.entries(itemCounts)
      .map(([itemName, data]) => ({
        itemName,
        requestCount: data.count,
        requestedBy: Array.from(data.requestors).join(', ')
      }))
      .sort((a, b) => b.requestCount - a.requestCount)
      .slice(0, 10);

    return chartData;
  };

  // Update the X-axis configuration function
  const getXAxisConfig = (data) => {
    const maxCount = Math.max(...data.map(item => item.requestCount));
    
    if (maxCount === 0) {
      return { domain: [0, 3], ticks: [0, 1, 2, 3] };
    } else if (maxCount <= 3) {
      return { domain: [0, 3], ticks: [0, 1, 2, 3] };
    } else if (maxCount <= 10) {
      return { domain: [0, 10], ticks: [0, 2, 4, 6, 8, 10] };
    } else {
      const ceiling = Math.ceil(maxCount / 5) * 5;
      return {
        domain: [0, ceiling],
        ticks: Array.from({ length: 6 }, (_, i) => Math.floor(ceiling * i / 5))
      };
    }
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys, selectedRows) => {
      setSelectedRowKeys(selectedKeys);
      setSelectedRows(selectedRows);
    },
  };

  // Create a unique key for each row
  const getRowKey = (record) => {
    return `${record.profileID}-${record.pantryID}-${record.itemName}`;
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          backgroundColor: 'white',
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '4px'
        }}>
          <p style={{ margin: '0', fontWeight: 'bold' }}>{data.itemName}</p>
          <p style={{ margin: '5px 0' }}>Requests: {data.requestCount}</p>
          <p style={{ margin: '0', fontSize: '12px' }}>
            Requested by: {data.requestedBy}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div id='request-report-container'>
      
      <div id='request-report-header'>
        <div className='request-report-header-left'>
          <Space>
            <Input
              placeholder='Search'
              value={searchText}
              onChange={handleSearch}
              style={{ width: 200, height: 30 }}
              prefix={<SearchOutlined />}
            />
            <Select
              value={selectedMonth}
              onChange={handleMonthChange}
              style={{ width: 120 }}
            >
              {months.map(month => (
                <Option key={month.value} value={month.value}>
                  {month.name}
                </Option>
              ))}
            </Select>
            <Select
              value={selectedYear}
              onChange={handleYearChange}
              style={{ width: 90 }}
            >
              {years.map(year => (
                <Option key={year} value={year}>
                  {year}
                </Option>
              ))}
            </Select>
            <div style={{ width: '10px' }} />
            <Checkbox 
              checked={includeCompleted}
              onChange={(e) => setIncludeCompleted(e.target.checked)}
            >
              Include completed requests
            </Checkbox>
          </Space>
        </div>
        <div className='request-report-header-right'>
          {selectedRows.length > 0 && (
            <Button
              onClick={handleCompleteSelected}
              style={{ 
                width: 100,
                height: 30,
                backgroundColor: 'white',
                border: '1px solid #4fc0e3',
                color: '#4fc0e3',
                marginRight: 8
              }}
            >
              Complete ({selectedRows.length})
            </Button>
          )}
          <Button onClick={() => {
            setSearchText('');
            setSelectedMonth(new Date().getMonth());
            setSelectedYear(new Date().getFullYear());
            setIncludeCompleted(false);
            setSelectedRowKeys([]);
            setSelectedRows([]);
          }}>
            Reset Filters
          </Button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
     
        </div>
      ) : (
        <div id='request-report-content'>
          <div id='request-report-barchart-container'>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart 
                data={getChartData()} 
                layout="vertical" 
                margin={{ top: 20, right: 30, left: 5, bottom: 20 }}
              >
                <CartesianGrid 
                  stroke="#ccc" 
                  strokeDasharray="3 3"
                  horizontal={true}
                  vertical={true}
                />
                <XAxis 
                  type="number"
                  label={{ 
                    value: 'Number of Requests', 
                    position: 'bottom',
                    offset: 0
                  }}
                  {...getXAxisConfig(getChartData())}
                  allowDecimals={false}
                />
                <YAxis 
                  type="category" 
                  dataKey="itemName"
                  width={120}
                  label={{ 
                    
                    angle: -90, 
                    position: 'insideLeft',
                    offset: 10
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="requestCount" 
                  fill="#4fc0e3"
                  barSize={20}
                >
                  {getChartData().map((entry, index) => {
                    let color = '#8ad142';  // Green for 1-2 people
                    if (entry.requestedBy.split(',').length > 5) {
                      color = '#F47174';  // Red for more than 5 people
                    } else if (entry.requestedBy.split(',').length >= 3) {
                      color = '#4fc0e3';  // Blue for 3-5 people
                    }
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div id='request-report-table-container'>
            <Table
              columns={columns}
              dataSource={getFilteredRequests()}
              rowKey={getRowKey}
              pagination={{ pageSize: 8, position: ['bottomCenter'] }}
              bordered
              rowSelection={rowSelection}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportRequested;
