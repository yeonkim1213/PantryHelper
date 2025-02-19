import React, { useState, useEffect } from 'react'
import './DashboardStaff.css'
import { fetchIncomingInventory } from '../../../services/incomingService'
import { fetchOutgoingInventory } from '../../../services/outgoingService'
import { fetchInventory } from '../../../services/inventoryService'
import { fetchEventsByPantry } from '../../../services/eventService'
import moment from 'moment'
import { useProfile } from '../../../context/ProfileContext'
import { Link } from 'react-router-dom'
import { Spin } from 'antd'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis
} from 'recharts'

const computeData = (type, incomingData, outgoingData) => {
  const today = moment()
  const startOfWeek = today.clone().startOf('week').add(1, 'days')
  const startOfMonth = today.clone().startOf('month')
  let totalIncoming = 0
  let totalOutgoing = 0
  if (incomingData) {
    incomingData.forEach(item => {
      const incomingDate = item.DateIn ? moment(item.DateIn) : null
      if (incomingDate) {
        const isToday = incomingDate.isSame(today, 'day')
        const isThisWeek = incomingDate.isBetween(
          startOfWeek,
          today,
          'day',
          '[]'
        )
        const isThisMonth = incomingDate.isBetween(
          startOfMonth,
          today,
          'day',
          '[]'
        )
        if (
          (type === 'daily' && isToday) ||
          (type === 'weekly' && isThisWeek) ||
          (type === 'monthly' && isThisMonth)
        ) {
          totalIncoming += parseInt(item.Quantity, 10)
        }
      }
    })
  }
  if (outgoingData) {
    outgoingData.forEach(item => {
      const outgoingDate = item.DateOut ? moment(item.DateOut) : null
      if (outgoingDate) {
        const isToday = outgoingDate.isSame(today, 'day')
        const isThisWeek = outgoingDate.isBetween(
          startOfWeek,
          today,
          'day',
          '[]'
        )
        const isThisMonth = outgoingDate.isBetween(
          startOfMonth,
          today,
          'day',
          '[]'
        )
        if (
          (type === 'daily' && isToday) ||
          (type === 'weekly' && isThisWeek) ||
          (type === 'monthly' && isThisMonth)
        ) {
          totalOutgoing += parseInt(item.Quantity, 10)
        }
      }
    })
  }
  const data = [
    { name: 'Incoming', value: totalIncoming },
    { name: 'Outgoing', value: totalOutgoing }
  ]
  return { data }
}

const getFormattedDate = date => date.format('MM/DD/YYYY')

const getWeeklyDateRange = today => {
  const startOfWeek = today.clone().subtract(6, 'days')
  const endOfWeek = today.clone()
  return `${getFormattedDate(startOfWeek)} ~ ${getFormattedDate(endOfWeek)}`
}

const getMonthlyDateRange = today => {
  const startOfMonth = today.clone().startOf('month')
  const endOfMonth = today.clone()
  return `${getFormattedDate(startOfMonth)} ~ ${getFormattedDate(endOfMonth)}`
}

const formatPercentage = (oldValue, newValue) => {
  if (oldValue === 0 && newValue === 0) return '0%'
  if (oldValue === 0) return '+100%'

  const percentChange = ((newValue - oldValue) / oldValue) * 100
  const formattedChange = Math.abs(percentChange).toFixed(1).replace(/\.0$/, '')
  return percentChange >= 0 ? `+${formattedChange}%` : `-${formattedChange}%`
}

const calculateChanges = (todayValue, yesterdayValue) => {
  return formatPercentage(yesterdayValue, todayValue)
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ 
        background: '#333', 
        padding: '8px', 
        border: 'none',
        borderRadius: '4px'
      }}>
        <p style={{ color: '#fff', margin: '0' }}>{label}</p>
        <p style={{ color: '#fff', margin: '0' }}>
          Quantity: {payload[0].value} lb
        </p>
      </div>
    );
  }
  return null;
};

// Add custom tooltip for pie chart
const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ 
        background: '#333', 
        padding: '8px', 
        border: 'none',
        borderRadius: '4px'
      }}>
        <p style={{ color: '#fff', margin: '0' }}>{payload[0].name}</p>
        <p style={{ color: '#fff', margin: '0' }}>
          Quantity: {payload[0].value} lb
        </p>
      </div>
    );
  }
  return null;
};

const DashboardStaff = () => {
  const [dailyData, setDailyData] = useState(null)
  const [events, setEvents] = useState([])
  const { profile } = useProfile()
 
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [incomingToday, setIncomingToday] = useState(0)
  const [incomingYesterday, setIncomingYesterday] = useState(0)
  const [incomingChange, setIncomingChange] = useState('0%')
  const [outgoingToday, setOutgoingToday] = useState(0)
  const [outgoingYesterday, setOutgoingYesterday] = useState(0)
  const [outgoingChange, setOutgoingChange] = useState('0%')
  const [lowStockItems, setLowStockItems] = useState([])
  const [incomingData, setIncomingData] = useState([])
  const [outgoingData, setOutgoingData] = useState([])

  const COLORS = ['#8ad142', '#F47174']
  const GREY_COLORS = ['#D3D3D3', '#A9A9A9']
  const today = moment()

  useEffect(() => {
    const fetchData = async () => {
      if (!profile?.currentPantry) {
        console.log('No pantry selected')
      
        return
      }

      try {
        setLoading(true)
        setError(null)

        const [
          incomingDataRes,
          outgoingDataRes,
       
          inventoryDataRes
        ] = await Promise.all([
          fetchIncomingInventory(profile.currentPantry),
          fetchOutgoingInventory(profile.currentPantry),
       
          fetchInventory(profile.currentPantry)
        ])

        const incomingData = incomingDataRes?.data || []
        const outgoingData = outgoingDataRes?.data || []
       
        const inventoryData = inventoryDataRes?.data || []

       
        setDailyData(computeData('daily', incomingData, outgoingData))
        processInventoryData(incomingData, outgoingData)

        const today = moment()
        const yesterday = today.clone().subtract(1, 'day')

        const todayIncoming = incomingData
          .filter(item => moment(item.DateIn).isSame(today, 'day'))
          .reduce((sum, item) => sum + parseInt(item.Quantity, 10), 0)

        const yesterdayIncoming = incomingData
          .filter(item => moment(item.DateIn).isSame(yesterday, 'day'))
          .reduce((sum, item) => sum + parseInt(item.Quantity, 10), 0)

        const todayOutgoing = outgoingData
          .filter(item => moment(item.DateOut).isSame(today, 'day'))
          .reduce((sum, item) => sum + parseInt(item.Quantity, 10), 0)

        const yesterdayOutgoing = outgoingData
          .filter(item => moment(item.DateOut).isSame(yesterday, 'day'))
          .reduce((sum, item) => sum + parseInt(item.Quantity, 10), 0)

        setIncomingToday(todayIncoming)
        setIncomingYesterday(yesterdayIncoming)
        setIncomingChange(calculateChanges(todayIncoming, yesterdayIncoming))

        setOutgoingToday(todayOutgoing)
        setOutgoingYesterday(yesterdayOutgoing)
        setOutgoingChange(calculateChanges(todayOutgoing, yesterdayOutgoing))

        setLowStockItems(getLowStockItems(inventoryData))
      } catch (error) {
        console.error('Error fetching data:', error)
        setError('Failed to load dashboard data.')

       
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [profile?.currentPantry])

  useEffect(() => {
    const loadEvents = async () => {
      if (!profile || !profile.currentPantry) {
        return
      }
      try {
        const eventsData = await fetchEventsByPantry(profile.currentPantry)
        if (eventsData && eventsData.data) {
          const allEvents = eventsData.data
          const upcomingEvents = allEvents
            .filter(event => moment(event.EventDate).isAfter(moment()))
            .sort((a, b) => moment(a.EventDate).diff(moment(b.EventDate)))
          setEvents(upcomingEvents)
        }
      } catch (error) {
        console.error('Error fetching events:', error)
        setError('Failed to load events.')
      }
    }
    loadEvents()
  }, [profile])

  

  const processInventoryData = (incomingData, outgoingData) => {
    const dates = []
    for (let i = 0; i <= 6; i++) {
      dates.push(
        moment()
          .subtract(6 - i, 'days')
          .format('YYYY-MM-DD')
      )
    }

    const incomingDailyData = dates.map(date => ({
      date: moment(date).format('MM/DD'),
      value: incomingData
        .filter(item => moment(item.DateIn).format('YYYY-MM-DD') === date)
        .reduce((sum, item) => sum + parseInt(item.Quantity, 10), 0)
    }))

    const outgoingDailyData = dates.map(date => ({
      date: moment(date).format('MM/DD'),
      value: outgoingData
        .filter(item => moment(item.DateOut).format('YYYY-MM-DD') === date)
        .reduce((sum, item) => sum + parseInt(item.Quantity, 10), 0)
    }))

    setIncomingData(incomingDailyData)
    setOutgoingData(outgoingDailyData)
  }

  const calculatePercentageChange = (current, previous) => {
    if (previous === 0) return current === 0 ? '0%' : '+100%'
    const change = ((current - previous) / previous) * 100
    return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`
  }

  const getLowStockItems = (inventoryData, threshold = 10) => {
    return inventoryData
      .filter(item => parseInt(item.Quantity) <= threshold)
      .sort((a, b) => parseInt(a.Quantity) - parseInt(b.Quantity))
  }

  if (!profile) {
    return (
      <div className='Dashboard'>
        <div className='loading-container'>
          <Spin tip='Loading records...' />
        </div>
      </div>
    )
  }

  return (
    <div className='Dashboard'>
      {error && <div className='error-message'>{error}</div>}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
      
      </div>
      ) : (
        <>
          <div id='dashboard-top-row'>
            <div id='welcome-box'>
              <div className='welcome-content'>
                <div className='welcome-text'>
                  <h4>Welcome</h4>
                  <span className='pantry-name'>{profile.name || 'Guest'}</span>
                </div>
                <div id='welcome-image-container'>
                  <img
                    src='/dashboard_image/foodTruck.png'
                    alt='Food Truck'
                    id='welcome-image'
                  />
                </div>
              </div>
            </div>
            <div className="boxes">
              <div id='incoming-box'>
                <h4>Incoming Inventory</h4>
                <p className='date-range'>
                  {moment().subtract(6, 'days').format('MM/DD/YY')} ~{' '}
                  {moment().format('MM/DD/YY')}
                </p>
                <div className='chart-wrapper'>
                  <ResponsiveContainer width='100%' height={80}>
                    <BarChart data={incomingData}>
                      <Bar dataKey='value' fill='#8ad142' />
                      <Tooltip content={<CustomTooltip />} />
                      <XAxis dataKey="date" hide />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className='value-container'>
                  <p className='value'>{incomingToday} lb</p>
                  <p
                    className='percentage'
                    style={{
                      color: incomingChange.includes('+') ? '#8ad142' : '#F47174'
                    }}
                  >
                    {incomingChange}
                  </p>
                </div>
              </div>
              <div id='outgoing-box'>
                <h4>Outgoing Inventory</h4>
                <p className='date-range'>
                  {moment().subtract(6, 'days').format('MM/DD/YY')} ~{' '}
                  {moment().format('MM/DD/YY')}
                </p>
                <div className='chart-wrapper'>
                  <ResponsiveContainer width='100%' height={80}>
                    <BarChart data={outgoingData}>
                      <Bar dataKey='value' fill='#F47174' />
                      <Tooltip content={<CustomTooltip />} />
                      <XAxis dataKey="date" hide />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className='value-container'>
                  <p className='value'>{outgoingToday} lb</p>
                  <p
                    className='percentage'
                    style={{
                      color: outgoingChange.includes('+') ? '#8ad142' : '#F47174'
                    }}
                  >
                    {outgoingChange}
                  </p>
                </div>
              </div>
              <div id='daily-report-box'>
                <h4>Daily Inventory Report</h4>
                <p className='date-range'>{moment().format('MM/DD/YY')}</p>
                <ResponsiveContainer width='100%' >
                  <PieChart>
                    <Pie
                      data={dailyData?.data || [{ name: 'No Data', value: 1 }]}
                      dataKey='value'
                      nameKey='name'
                      cx='50%'
                      cy='50%'
                      outerRadius='60%'
                      label={({ percent }) => `${(percent * 100).toFixed(1)}%`}
                    >
                      {(dailyData?.data || []).map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.value > 0 ? COLORS[index] : GREY_COLORS[index]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div id='dashboard-second-row'>
            <div id='low-stock-box'>
              <div className='section-header'>
                <h4>Low Stock Items</h4>
                <Link to='/inventory' className='see-more-button'>
                  See all items
                </Link>
              </div>
              {lowStockItems.length > 0 ? (
                <ul className='low-stock-list'>
                  {lowStockItems.slice(0, 7).map((item, index) => (
                    <li key={index} className='low-stock-item'>
                      <span className='item-name'>{item.Name}</span>
                      <span className='item-quantity'>{item.Quantity} lb</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No low stock items.</p>
              )}
            </div>
            <div className='events-section'>
              <div className='section-header'>
                <h4>Upcoming Events</h4>
                <Link to='/event' className='see-more-button'>
                  See more events
                </Link>
              </div>
              {events.length > 0 ? (
                <ul className='event-list'>
                  {events.slice(0, 3).map(event => (
                    <li key={event.id} className='event-item'>
                      <img
                        src={event.IconPath}
                        alt={event.EventTitle}
                        className='event-icon'
                      />
                      <div className='event-info'>
                        <div className='event-title-row'>
                          <Link to='/event' className='event-title'>
                            <strong>{event.EventTitle}</strong>
                          </Link>
                          <span className='event-date'>
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
  )
}

export default DashboardStaff
