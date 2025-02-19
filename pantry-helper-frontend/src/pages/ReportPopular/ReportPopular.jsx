import React, { useEffect, useState } from 'react';
import { fetchIncomingInventory } from '../../services/incomingService';
import { fetchOutgoingInventory } from '../../services/outgoingService';
import { useProfile } from '../../context/ProfileContext';
import { Table, Spin, Select, Button, Space } from 'antd';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import './ReportPopular.css';

const { Option } = Select;

const ReportPopular = () => {
  const [incomingInventoryData, setIncomingInventoryData] = useState([]);
  const [outgoingInventoryData, setOutgoingInventoryData] = useState([]);
  const [popularityData, setPopularityData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { profile } = useProfile();
  const [selectedItems, setSelectedItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    if (profile?.currentPantry) {
      fetchInventoryData();
    }
  }, [profile?.currentPantry]);

  const calculatePopularity = (incomingData, outgoingData) => {
    const itemMap = new Map();

    incomingData.forEach(item => {
      if (!itemMap.has(item.Name)) {
        itemMap.set(item.Name, {
          name: item.Name,
          incoming: item.Quantity || 0,
          outgoing: 0
        });
      }
    });

    outgoingData.forEach(item => {
      if (itemMap.has(item.Name)) {
        const currentItem = itemMap.get(item.Name);
        currentItem.outgoing = item.Quantity || 0;
      }
    });

    const popularityArray = Array.from(itemMap.values()).map(item => {
      const total = item.incoming + item.outgoing;
      const popularity = total === 0 ? 0 : Math.round((item.outgoing / total) * 100);
      return {
        name: item.name,
        value: popularity,
        incoming: item.incoming,
        outgoing: item.outgoing
      };
    });

    return popularityArray.sort((a, b) => b.value - a.value);
  };

  const fetchInventoryData = async () => {
    setLoading(true);
    try {
      const [incomingResponse, outgoingResponse] = await Promise.all([
        fetchIncomingInventory(profile.currentPantry),
        fetchOutgoingInventory(profile.currentPantry)
      ]);

      const incomingData = Array.isArray(incomingResponse) ? incomingResponse : incomingResponse.data || [];
      const outgoingData = Array.isArray(outgoingResponse) ? outgoingResponse : outgoingResponse.data || [];

      const processedIncoming = incomingData.map(item => ({
        ...item,
        incomingDate: item.incomingDate || new Date().toISOString()
      }));

      setIncomingInventoryData(processedIncoming);
      setOutgoingInventoryData(outgoingData);

      const calculatedPopularity = calculatePopularity(processedIncoming, outgoingData);
      setPopularityData(calculatedPopularity);

    } catch (error) {
      console.error('Failed to fetch inventory data:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Item Name',
      dataIndex: 'name',
      key: 'name',
      width: '40%',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Popularity (%)',
      dataIndex: 'value',
      key: 'value',
      width: '30%',
      sorter: (a, b) => a.value - b.value,
      render: (value) => `${value}%`,
    },
    {
      title: 'Stock Status',
      dataIndex: 'stockStatus',
      key: 'stockStatus',
      width: '30%',
      render: (_, record) => {
        const item = incomingInventoryData.find(item => item.Name === record.name);
        const quantity = item ? item.Quantity : 0;
        
        let color;
        let status;
        
        if (quantity === 0) {
          color = '#F47174';
          status = 'Out of Stock';
        } else if (quantity > 0 && quantity <= 25) {
          color = '#4fc0e3';
          status = 'Few Items Left';
        } else {
          color = '#8ad142';
          status = 'In Stock';
        }

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: color,
                display: 'inline-block'
              }}
            />
            <span>{status}</span>
          </div>
        );
      },
    },
  ];

  const getFilteredData = () => {
    if (!popularityData.length) return [];

    return popularityData.filter(item => {
      if (selectedItems.length > 0 && !selectedItems.includes(item.name)) {
        return false;
      }
      return true;
    });
  };

  const getChartData = () => {
    const filteredData = getFilteredData();
    
    const nonZeroData = filteredData.filter(item => 
      item.value > 0 || (selectedItems.length > 0 && selectedItems.includes(item.name))
    );

    if (!nonZeroData.length) {
      return [{
        name: 'No data',
        value: 0
      }];
    }

    return nonZeroData.slice(0, 7);
  };

  const CustomTooltip = ({ active, payload }) => {
    if (!popularityData.length) {
      return (
        <div className="custom-tooltip">
          <p style={{ color: '#666' }}>No data</p>
        </div>
      );
    }

    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p style={{ color: '#666' }}><strong>{payload[0].payload.name}</strong></p>
          <p style={{ color: '#666' }}>Popularity: {payload[0].value}%</p>
        </div>
      );
    }
    return null;
  };

  const handleItemSelect = (value) => {
    setSelectedItems(value);
  };

  return (
    <div id='request-report-container'>
      <div id='request-report-header'>
        <div className='request-report-header-left'>
          <Select
            mode="multiple"
            placeholder="Select items"
            value={selectedItems}
            onChange={handleItemSelect}
            style={{ width: 200, marginRight: 8 }}
            allowClear
          >
            {popularityData.map(item => (
              <Option key={item.name} value={item.name}>
                {item.name}
              </Option>
            ))}
          </Select>
        </div>
        <div className='request-report-header-right'>
          <Button onClick={() => setSelectedItems([])}>
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
          
            <ResponsiveContainer 
              width="100%" 
              height={400}
              minWidth={350}  // Add minimum width
            >
              <BarChart
                data={getChartData()}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 50, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  type="number"
                  domain={[0, 100]}
                  label={{ 
                    value: 'Popularity (%)', 
                    position: 'bottom',
                    offset: 0
                  }}
                />
                <YAxis 
                  type="category"
                  dataKey="name"
                  width={120}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="value" 
                  barSize={getChartData().length <= 3 ? 40 : 20}  // Adjust bar height based on number of items
                >
                  {getChartData().map((entry, index) => {
                    let color = '#F47174';  // Red for <30%
                    if (entry.value > 70) {
                      color = '#8ad142';  // Green for >70%
                    } else if (entry.value >= 30) {
                      color = '#4fc0e3';  // Blue for 30-70%
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
              dataSource={getFilteredData()}
              rowKey="name"
              pagination={{ 
                pageSize: pageSize,
                current: currentPage,
                onChange: (page) => setCurrentPage(page),
                position: ['bottomCenter'] 
              }}
              bordered
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportPopular;