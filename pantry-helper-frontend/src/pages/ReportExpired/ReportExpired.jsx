import React, { useEffect, useState } from 'react'
import { fetchInventory, deleteItem } from '../../services/inventoryService'
import { Table, Modal, message, Input, Button, Pagination, Spin } from 'antd'
import moment from 'moment'
import './ReportExpired.css'
import { useProfile } from '../../context/ProfileContext';
import { fetchPantryUsers } from '../../services/pantryUserService'
import { DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { Space } from 'antd';


const ReportExpired = () => {
  const [inventory, setInventory] = useState([])
  const [filteredInventory, setFilteredInventory] = useState([]) // Filtered state for searching
  const [soonExpiringDays, setSoonExpiringDays] = useState('');
  const [searchTerm, setSearchTerm] = useState('') // State for search input
  const [currentPageExpired, setCurrentPageExpired] = useState(1)
  const [currentPageSoon, setCurrentPageSoon] = useState(1)
  const [pageSize] = useState(8)
  const { profile } = useProfile();
  const [userAuthority, setUserAuthority] = useState('')
  const [selectedRowKeysExpired, setSelectedRowKeysExpired] = useState([]);
  const [selectedRowKeysSoon, setSelectedRowKeysSoon] = useState([]);
  const [searchTermSoon, setSearchTermSoon] = useState('');
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Fetch pantry user authority whenever currentPantry updates
    const fetchPantryUser = async () => {
      try {
        const response = await fetchPantryUsers();
        const pantryUsers = response.data;
  
        // Find user authority for the current profileID and currentPantry
        const currentAuthority = pantryUsers.find(
          user => user.profileID === profile?.profileID && user.pantryID === profile.currentPantry
        )?.userAuthority;
  
        setUserAuthority(currentAuthority || null); // Set or clear user authority
      } catch (error) {
        console.error('Error fetching pantry users:', error);
      }
    };
  
    if (profile ) {
      fetchPantryUser();
    }
  }, [profile]);

  // Update the initial useEffect
  useEffect(() => {
    if(profile){
      loadInventory()
    }
  }, [profile])

  const loadInventory = async () => {
    setLoading(true)
    try {
      const response = await fetchInventory(profile.currentPantry)
      const data = response.data
        .filter(item => item.Quantity > 0)
        .map(item => ({
          ...item,
          key: item.id,
        }))

      setInventory(data)
      
      // Filter and sort expired items (longest expired first)
      const expiredItems = data
        .filter(item => 
          moment(item.ExpDate).isValid() && 
          moment(item.ExpDate).isBefore(moment())
        )
        .sort((a, b) => moment(a.ExpDate).valueOf() - moment(b.ExpDate).valueOf())

      setFilteredInventory(expiredItems)
    } catch (error) {
      console.error('Error fetching inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  // Add this new function to get expired items
  const getExpiredItems = () => {
    const today = moment()
    return inventory.filter(item => {
      const expDate = moment(item.ExpDate)
      return expDate.isValid() && expDate.isBefore(today)
    })
  }

  // Update the handleSearch function
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase()
    setSearchTerm(value)
    
    // Filter from inventory, not filteredInventory
    const expiredItems = getExpiredItems()
    const filtered = expiredItems.filter(item =>
      item.Name.toLowerCase().includes(value)
    )
    setFilteredInventory(filtered)
  }

  const handleDelete = async id => {
    Modal.confirm({
      title: 'Are you sure you want to delete this item?',
      onOk: async () => {
        try {
          await deleteItem(id, profile.currentPantry)
          await loadInventory()  // Reload inventory data
          message.success('Item deleted')
          // Reset selections
          setSelectedRowKeysExpired([])
          setSelectedRowKeysSoon([])
          setCurrentPageExpired(1)  // Reset to first page
        } catch (error) {
          console.error('Error deleting item:', error)
          message.error('Failed to delete item')
        }
      }
    })
  }

  const getSoonExpiringItems = () => {
    const today = moment()
    return inventory.filter(item => {
      const expDate = moment(item.expirationDate)
      return (
        expDate.isValid() &&
        expDate.isAfter(today) &&
        expDate.diff(today, 'days') <= soonExpiringDays
      )
    })
  }

  const handleDeleteSelected = async (items) => {
    Modal.confirm({
      title: 'Are you sure you want to delete these items?',
      onOk: async () => {
        setLoading(true)  // Start loading state
        try {
          // Wait for all deletions to complete
          await Promise.all(items.map(id => deleteItem(id, profile.currentPantry)))
          
          // Reset selections before loading new data
          setSelectedRowKeysExpired([])
          setSelectedRowKeysSoon([])
          setCurrentPageExpired(1)
          setCurrentPageSoon(1)
          
          // Load new data
          const response = await fetchInventory(profile.currentPantry)
          const data = response.data
            .filter(item => item.Quantity > 0)
            .map(item => ({
              ...item,
              expirationDate: moment(item.ExpDate).isValid()
                ? moment(item.ExpDate)
                : null
            }))
          
          // Update both states with new data
          setInventory(data)
          setFilteredInventory(data)
          
          message.success('Selected items deleted successfully')
        } catch (error) {
          console.error('Error deleting selected items:', error)
          message.error('Failed to delete selected items')
        } finally {
          setLoading(false)  // End loading state
        }
      }
    })
  }

  const handleSearchSoon = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTermSoon(value);
  };

  const getFilteredSoonExpiringItems = () => {
    const today = moment()
    const daysToCheck = parseInt(soonExpiringDays) || 30
    
    const soonExpiring = inventory
      .filter(item => {
        const expDate = moment(item.ExpDate)
        return (
          item.Quantity > 0 &&
          expDate.isValid() &&
          expDate.isAfter(today) &&
          expDate.diff(today, 'days') <= daysToCheck
        )
      })
      // Sort by closest to expiring first
      .sort((a, b) => moment(a.ExpDate).valueOf() - moment(b.ExpDate).valueOf())
      .filter(item =>
        item.Name.toLowerCase().includes(searchTermSoon.toLowerCase())
      )

    return soonExpiring
  }

  const columns = [
    {
      title: 'Name',
      dataIndex: 'Name',
    },
    {
      title: 'Quantity (lb)',
      dataIndex: 'Quantity',
      render: text => `${text} lb`
    },
    {
      title: 'Expiration Date',
      dataIndex: 'ExpDate',
      render: date => (date ? moment(date).format('YYYY-MM-DD') : 'N/A')
    },
    {
      title: 'Action',
      dataIndex: 'id',
      render: (id) => (
        <DeleteOutlined
          className="action-icon delete-icon"
          onClick={() => handleDelete(id)}
          style={{ cursor: 'pointer' }}
          disabled={userAuthority === 'recipient'}
        />
      )
    }
  ]

  const handlePaginationChangeExpired = page => {
    setCurrentPageExpired(page)
  }

  const handlePaginationChangeSoon = page => {
    setCurrentPageSoon(page)
  }

  const paginatedExpiredItems = filteredInventory.slice(
    (currentPageExpired - 1) * pageSize,
    currentPageExpired * pageSize
  )
  const paginatedSoonExpiringItems = getFilteredSoonExpiringItems().slice(
    (currentPageSoon - 1) * pageSize,
    currentPageSoon * pageSize
  )

  // Update the resetExpiredFilters function
  const resetExpiredFilters = () => {
    setSearchTerm('')
    setSelectedRowKeysExpired([])
    setCurrentPageExpired(1)
    setFilteredInventory(getExpiredItems()) // Reset to expired items only
  }

  const resetSoonFilters = () => {
    setSearchTermSoon('')
    setSoonExpiringDays('')
    setSelectedRowKeysSoon([])
    setCurrentPageSoon(1)
  }

  return (
    <div id='expired-container'>
      {loading ? (
        <div className="loading-container">
      
        </div>
      ) : (
        <div id='expired-tables-container'>
          {/* Expired Items */}
          <div id='expired-table'>
            <div id='expired-header'>
              <div className='expired-header-left'>
                <Space>
                  <Input
                    id="expired-search-input"
                    placeholder='Search by name'
                    value={searchTerm}
                    onChange={handleSearch}
                    style={{ width: 150 }}
                    prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                  />
                </Space>
              </div>
              <div className='expired-header-right'>
                {selectedRowKeysExpired.length > 0 && (
                  <Button 
                    id="expired-delete-button"
                    onClick={() => handleDeleteSelected(selectedRowKeysExpired)}
                    disabled={userAuthority === 'recipient'}
                  >
                    Delete ({selectedRowKeysExpired.length})
                  </Button>
                )}
                <Button onClick={resetExpiredFilters}>
                  Reset Filters
                </Button>
              </div>
            </div>
            <h4>Expired Items</h4>
            <Table
              dataSource={paginatedExpiredItems}
              columns={columns}
              rowKey='id'
              pagination={false}
              rowSelection={{
                selectedRowKeys: selectedRowKeysExpired,
                onChange: (selectedKeys) => setSelectedRowKeysExpired(selectedKeys),
                disabled: userAuthority === 'recipient'
              }}
            />
            <div id='expired-pagination'>
              <Pagination
                current={currentPageExpired}
                total={filteredInventory.length}
                pageSize={pageSize}
                onChange={handlePaginationChangeExpired}
              />
            </div>
          </div>

          {/* Soon Expiring Items */}
          <div id='soon-table'>
            <div id='soon-header'>
              <div className='expired-header-left'>
                <Space>
                  <Input
                    id="soon-search-input"
                    placeholder='Search by name'
                    value={searchTermSoon}
                    onChange={handleSearchSoon}
                    style={{ width: 150 }}
                    prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                  />
                  <Input
                    id="soon-days-input"
                    placeholder='30 days left'
                    type='number'
                    value={soonExpiringDays}
                    onChange={e => {
                      const value = e.target.value;
                      setSoonExpiringDays(value === '' ? '' : value);
                    }}
                    style={{ width: 130 }}
                  />
                </Space>
              </div>
              <div className='expired-header-right'>
                {selectedRowKeysSoon.length > 0 && (
                  <Button 
                    id="soon-delete-button"
                    onClick={() => handleDeleteSelected(selectedRowKeysSoon)}
                    disabled={userAuthority === 'recipient'}
                  >
                    Delete ({selectedRowKeysSoon.length})
                  </Button>
                )}
                <Button onClick={resetSoonFilters}>
                  Reset Filters
                </Button>
              </div>
            </div>
            <h4>Soon Expiring Items</h4>
            <Table
              dataSource={paginatedSoonExpiringItems}
              columns={columns}
              rowKey='id'
              pagination={false}
              rowSelection={{
                selectedRowKeys: selectedRowKeysSoon,
                onChange: (selectedKeys) => setSelectedRowKeysSoon(selectedKeys),
                disabled: userAuthority === 'recipient'
              }}
            />
            <div id='soon-pagination'>
              <Pagination
                current={currentPageSoon}
                total={getFilteredSoonExpiringItems().length}
                pageSize={pageSize}
                onChange={handlePaginationChangeSoon}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReportExpired
