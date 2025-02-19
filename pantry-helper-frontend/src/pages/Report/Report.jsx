import React, { useEffect, useState } from 'react';
import { fetchIncomingInventory } from '../../services/incomingService';
import { fetchOutgoingInventory } from '../../services/outgoingService';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Select, Button, Spin, Alert } from 'antd';
import moment from 'moment';
import './Report.css';
import { useProfile } from '../../context/ProfileContext';

const { Option } = Select;
const months = moment.months();

const Report = () => {
  const [incomingInventoryData, setIncomingInventoryData] = useState([]);
  const [outgoingInventoryData, setOutgoingInventoryData] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(moment().month());
  const [selectedYear, setSelectedYear] = useState(moment().year());

  const [chartData, setChartData] = useState([]);
  const [itemChartData, setItemChartData] = useState({
    incoming: [],
    outgoing: [],
    items: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { profile } = useProfile();

  useEffect(() => {
    if (profile && profile.currentPantry) {
      fetchInventoryData();
    }
  }, [profile?.currentPantry]);

  const fetchInventoryData = async () => {
    setLoading(true);
    setError(null);
    try {
      const incomingResponse = await fetchIncomingInventory(profile.currentPantry);
      const incomingInventory = Array.isArray(incomingResponse)
        ? incomingResponse
        : incomingResponse.data || [];
      setIncomingInventoryData(incomingInventory);

      const outgoingResponse = await fetchOutgoingInventory(profile.currentPantry);
      const outgoingInventory = Array.isArray(outgoingResponse)
        ? outgoingResponse
        : outgoingResponse.data || [];
      setOutgoingInventoryData(outgoingInventory);
    } catch (error) {
      setError('Failed to fetch inventory data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!Array.isArray(incomingInventoryData) || !Array.isArray(outgoingInventoryData)) return;
    const filteredIncoming = incomingInventoryData.filter((item) => {
      const incomingDate = item.DateIn ? moment(item.DateIn) : null;
      return (
        incomingDate &&
        incomingDate.month() === selectedMonth &&
        incomingDate.year() === selectedYear
      );
    });
    const filteredOutgoing = outgoingInventoryData.filter((item) => {
      const outgoingDate = item.DateOut ? moment(item.DateOut) : null;
      return (
        outgoingDate &&
        outgoingDate.month() === selectedMonth &&
        outgoingDate.year() === selectedYear
      );
    });
    const uniqueItemNames = [
      ...new Set([
        ...filteredIncoming.map((item) => item.Name),
        ...filteredOutgoing.map((item) => item.Name),
      ]),
    ].sort((a, b) => a.localeCompare(b));
    setItemOptions(uniqueItemNames);
    setSelectedItems([]);
  }, [incomingInventoryData, outgoingInventoryData, selectedMonth, selectedYear]);

  useEffect(() => {
    processInventoryData();
  }, [
    incomingInventoryData,
    outgoingInventoryData,
    selectedMonth,
    selectedYear,
    selectedItems,
  ]);

  const processInventoryData = () => {
    if (!Array.isArray(incomingInventoryData) || !Array.isArray(outgoingInventoryData)) return;

    const filteredIncomingData = incomingInventoryData.filter((item) => {
      const incomingDate = item.DateIn ? moment(item.DateIn) : null;
      const isSameMonth =
        incomingDate &&
        incomingDate.month() === selectedMonth &&
        incomingDate.year() === selectedYear;
      const isSelectedItem =
        !selectedItems.length || selectedItems.includes(item.Name);
      return isSelectedItem && isSameMonth;
    });

    const filteredOutgoingData = outgoingInventoryData.filter((item) => {
      const outgoingDate = item.DateOut ? moment(item.DateOut) : null;
      const isSameMonth =
        outgoingDate &&
        outgoingDate.month() === selectedMonth &&
        outgoingDate.year() === selectedYear;
      const isSelectedItem =
        !selectedItems.length || selectedItems.includes(item.Name);
      return isSelectedItem && isSameMonth;
    });

    const incoming = {};
    filteredIncomingData.forEach((item) => {
      const incomingDate = moment(item.DateIn);
      const weekNumber =
        incomingDate.week() - incomingDate.clone().startOf('month').week() + 1;
      incoming[weekNumber] = (incoming[weekNumber] || 0) + item.Quantity;
    });

    const outgoing = {};
    filteredOutgoingData.forEach((item) => {
      const outgoingDate = moment(item.DateOut);
      const weekNumber =
        outgoingDate.week() - outgoingDate.clone().startOf('month').week() + 1;
      outgoing[weekNumber] = (outgoing[weekNumber] || 0) + item.Quantity;
    });

    const weeksInMonth = getWeeksInMonth(selectedMonth, selectedYear);

    let processedData = weeksInMonth.map((weekNumber, index) => {
      const incomingValue = incoming[weekNumber] || 0;
      const outgoingValue = outgoing[weekNumber] || 0;
      return {
        week: `Week ${index + 1}`,
        weekNumber: index + 1,
        incoming: incomingValue,
        outgoing: outgoingValue,
        total: incomingValue - outgoingValue,
      };
    });

    if (processedData.length === 0) {
      processedData = [{
        week: 'Week 1',
        weekNumber: 1,
        incoming: 0,
        outgoing: 0,
        total: 0,
      }];
    }

    setChartData(processedData);
    processItemChartData(filteredIncomingData, filteredOutgoingData, weeksInMonth, itemOptions);
  };

  const processItemChartData = (filteredIncomingData, filteredOutgoingData, weeksInMonth, itemNames) => {
    if (!filteredIncomingData || !filteredOutgoingData || !weeksInMonth) return;

    if (itemNames.length === 0) {
      itemNames = ['No Data'];
    }

    const incomingItems = {};
    const outgoingItems = {};

    weeksInMonth.forEach((weekNumber) => {
      incomingItems[weekNumber] = {};
      outgoingItems[weekNumber] = {};
    });

    filteredIncomingData.forEach((item) => {
      const itemName = item.Name;
      const incomingDate = moment(item.DateIn);
      const weekNumber =
        incomingDate.week() - incomingDate.clone().startOf('month').week() + 1;
      if (incomingItems[weekNumber]) {
        incomingItems[weekNumber][itemName] =
          (incomingItems[weekNumber][itemName] || 0) + item.Quantity;
      }
    });

    filteredOutgoingData.forEach((item) => {
      const itemName = item.Name;
      const outgoingDate = moment(item.DateOut);
      const weekNumber =
        outgoingDate.week() - outgoingDate.clone().startOf('month').week() + 1;
      if (outgoingItems[weekNumber]) {
        outgoingItems[weekNumber][itemName] =
          (outgoingItems[weekNumber][itemName] || 0) + item.Quantity;
      }
    });

    if (itemNames.includes('No Data')) {
      weeksInMonth.forEach((weekNumber) => {
        incomingItems[weekNumber]['No Data'] = 0;
        outgoingItems[weekNumber]['No Data'] = 0;
      });
    }

    const incomingChartData = weeksInMonth.map((weekNumber, index) => {
      const weekData = { week: `Week ${index + 1}`, weekNumber: index + 1 };
      itemNames.forEach((itemName) => {
        weekData[itemName] = incomingItems[weekNumber][itemName] || 0;
      });
      return weekData;
    });

    const outgoingChartData = weeksInMonth.map((weekNumber, index) => {
      const weekData = { week: `Week ${index + 1}`, weekNumber: index + 1 };
      itemNames.forEach((itemName) => {
        weekData[itemName] = outgoingItems[weekNumber][itemName] || 0;
      });
      return weekData;
    });

    if (incomingChartData.length === 0) {
      incomingChartData.push({
        week: 'Week 1',
        weekNumber: 1,
        [itemNames[0]]: 0,
      });
    }

    if (outgoingChartData.length === 0) {
      outgoingChartData.push({
        week: 'Week 1',
        weekNumber: 1,
        [itemNames[0]]: 0,
      });
    }

    setItemChartData({
      incoming: incomingChartData,
      outgoing: outgoingChartData,
      items: itemNames,
    });
  };

  const getWeeksInMonth = (month, year) => {
    const startOfMonth = moment([year, month]).startOf('month');
    const endOfMonth = moment([year, month]).endOf('month');
    const weeks = [];
    let currentWeek = startOfMonth.clone();

    while (currentWeek.isSameOrBefore(endOfMonth)) {
      const weekNum =
        currentWeek.week() - currentWeek.clone().startOf('month').week() + 1;
      if (!weeks.includes(weekNum)) {
        weeks.push(weekNum);
      }
      currentWeek.add(1, 'week');
    }

    return weeks;
  };

  const resetFilters = () => {
    setSelectedMonth(moment().month());
    setSelectedYear(moment().year());
    setSelectedItems([]);
  };

  const incomingColors = [
    '#addc91',
    '#1fa040',
    '#7eb7e8',
    '#0072ce',
    '#89b6b5',
    '#257675',
    '#9daecc',
    '#d3f9d8',
  ];

  const outgoingColors = [
    '#ffc372',
    '#dc731c',
    '#baa496',
    '#745745',
    '#dc9cbf',
    '#a01b68',
    '#e79e8e',
    '#d14124',
  ];

  const incomingColorsMap = {};
  const outgoingColorsMap = {};

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
      
    </div>
    );
  }

  if (error) {
    return (
      <div id="report-wrapper">
        <Alert message="Error" description={error} type="error" showIcon />
      </div>
    );
  }

  return (
    <div id="report-wrapper">
      <div id="report-filters">
        <div id="report-filters-left">
          <Select
            className="report-select-items"
            mode='multiple'
            allowClear
            placeholder='Select Items'
            value={selectedItems}
            onChange={(value) => setSelectedItems(value)}
          >
            {itemOptions.map((itemName) => (
              <Option key={itemName} value={itemName}>
                {itemName}
              </Option>
            ))}
          </Select>

          <Select
            id="report-select-month"
            value={selectedMonth}
            onChange={(value) => setSelectedMonth(value)}
          >
            {months.map((month, index) => (
              <Option key={index} value={index}>
                {month}
              </Option>
            ))}
          </Select>

          <Select
            id="report-select-year"
            value={selectedYear}
            onChange={(value) => setSelectedYear(value)}
          >
            {[...Array(10)].map((_, index) => {
              const year = moment().year() - index;
              return (
                <Option key={year} value={year}>
                  {year}
                </Option>
              );
            })}
          </Select>
        </div>

        <div id="report-filters-right">
          <Button id="report-reset-button" onClick={resetFilters}>
            Reset Filters
          </Button>
        </div>
      </div>

      <div className="report-graph-row-1">
        <div className="graph-box">
          <h3 className='chart-title'>Incoming Donations</h3>
          <ResponsiveContainer width='100%' height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis
                dataKey='weekNumber'
                tickFormatter={(index) => `Week ${index}`}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                domain={[0, 'auto']}
                label={{
                  value: 'Quantity',
                  angle: -90,
                  position: 'insideLeft',
                  fontSize: 14
                }}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${value} lb`}
              />
              <Tooltip
                labelFormatter={(label) => `Week ${label}`}
                content={({ payload, label }) => {
                  if (!payload || payload.length === 0) {
                    return (
                      <div className="report-custom-tooltip">
                        <p style={{ color: '#666' }}>{`Week ${label}`}</p>
                        <p style={{ color: '#666' }}>{`No Data`}</p>
                      </div>
                    );
                  }

                  const totalValue = payload.reduce(
                    (sum, entry) => sum + (entry.value || 0),
                    0
                  );

                  if (totalValue === 0) {
                    return (
                      <div className="report-custom-tooltip">
                        <p style={{ color: '#666' }}>{`Week ${label}`}</p>
                        <p style={{ color: '#666' }}>{`0 lb`}</p>
                      </div>
                    );
                  }

                  const filteredPayload = payload.filter(
                    (entry) => entry.value > 0
                  );

                  return (
                    <div className="report-custom-tooltip">
                      <p style={{ color: '#666', marginBottom: '5px' }}>{`Week ${label}`}</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxWidth: '300px' }}>
                        {filteredPayload.map((entry, index) => (
                          <span key={index} style={{ 
                            color: entry.color,
                            whiteSpace: 'nowrap'
                          }}>
                            {`${entry.name}: ${entry.value} lb${index < filteredPayload.length - 1 ? ',' : ''}`}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                }}
              />
              <Line
                type='monotone'
                dataKey='incoming'
                stroke='#4fc0e3'
                name='Incoming Donations'
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="graph-box">
          <h3 className='chart-title'>Outgoing Donations</h3>
          <ResponsiveContainer width='100%' height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis
                dataKey='weekNumber'
                tickFormatter={(index) => `Week ${index}`}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                domain={[0, 'auto']}
                label={{
                  value: 'Quantity',
                  angle: -90,
                  position: 'insideLeft',
                  fontSize: 14
                }}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${value} lb`}
              />
              <Tooltip
                labelFormatter={(label) => `Week ${label}`}
                content={({ payload, label }) => {
                  if (!payload || payload.length === 0) {
                    return (
                      <div className="report-custom-tooltip">
                        <p style={{ color: '#666' }}>{`Week ${label}`}</p>
                        <p style={{ color: '#666' }}>{`No Data`}</p>
                      </div>
                    );
                  }

                  const totalValue = payload.reduce(
                    (sum, entry) => sum + (entry.value || 0),
                    0
                  );

                  if (totalValue === 0) {
                    return (
                      <div className="report-custom-tooltip">
                        <p style={{ color: '#666' }}>{`Week ${label}`}</p>
                        <p style={{ color: '#666' }}>{`0 lb`}</p>
                      </div>
                    );
                  }

                  const filteredPayload = payload.filter(
                    (entry) => entry.value > 0
                  );

                  return (
                    <div className="report-custom-tooltip">
                      <p style={{ color: '#666', marginBottom: '5px' }}>{`Week ${label}`}</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxWidth: '300px' }}>
                        {filteredPayload.map((entry, index) => (
                          <span key={index} style={{ 
                            color: entry.color,
                            whiteSpace: 'nowrap'
                          }}>
                            {`${entry.name}: ${entry.value} lb${index < filteredPayload.length - 1 ? ',' : ''}`}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                }}
              />
              <Line
                type='monotone'
                dataKey='outgoing'
                stroke='#F47174'
                name='Outgoing Donations'
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="graph-box">
          <h3 className='chart-title'>Total Donations</h3>
          <ResponsiveContainer width='100%' height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis
                dataKey='weekNumber'
                tickFormatter={(index) => `Week ${index}`}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                domain={[0, 'auto']}
                label={{
                  value: 'Quantity',
                  angle: -90,
                  position: 'insideLeft',
                  fontSize: 14,
                  offset: 1
                }}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${value} lb`}
              />
              <Tooltip
                labelFormatter={(label) => `Week ${label}`}
                content={({ payload, label }) => {
                  if (!payload || payload.length === 0) {
                    return (
                      <div className="report-custom-tooltip">
                        <p style={{ color: '#666' }}>{`Week ${label}`}</p>
                        <p style={{ color: '#666' }}>{`No Data`}</p>
                      </div>
                    );
                  }

                  const totalValue = payload.reduce(
                    (sum, entry) => sum + (entry.payload?.total || 0),
                    0
                  );

                  if (totalValue === 0) {
                    return (
                      <div className="report-custom-tooltip">
                        <p style={{ color: '#666' }}>{`Week ${label}`}</p>
                        <p style={{ color: '#666' }}>{`0 lb`}</p>
                      </div>
                    );
                  }

                  return (
                    <div className="report-custom-tooltip">
                      <p style={{ color: '#666', marginBottom: '5px' }}>{`Week ${label}`}</p>
                      <p style={{ color: '#8ad142' }}>{`Incoming - Outgoing: ${totalValue} lb`}</p>
                    </div>
                  );
                }}
              />
              <Line
                type='monotone'
                dataKey='total'
                stroke='#8ad142'
                name='Total Donations'
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="report-graph-row-2">
        <div className="graph-box">
          <h3 className='chart-title'>Incoming Items</h3>
          <ResponsiveContainer width='100%' height={320}>
            <LineChart data={itemChartData.incoming}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis
                dataKey='weekNumber'
                tickFormatter={(index) => `Week ${index}`}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                domain={[0, 'auto']}
                label={{
                  value: 'Quantity',
                  angle: -90,
                  position: 'insideLeft',
                  fontSize: 13,
                }}
                tick={{ fontSize: 12 }}
                allowDataOverflow={false}
                tickFormatter={(value) => `${value} lb`}
              />
              <Tooltip
                labelFormatter={(label) => `Week ${label}`}
                content={({ payload, label }) => {
                  if (!payload || payload.length === 0) {
                    return (
                      <div className="report-custom-tooltip">
                        <p style={{ color: '#666' }}>{`Week ${label}`}</p>
                        <p style={{ color: '#666' }}>{`No Data`}</p>
                      </div>
                    );
                  }

                  const totalValue = payload.reduce(
                    (sum, entry) => sum + (entry.value || 0),
                    0
                  );

                  if (totalValue === 0) {
                    return (
                      <div className="report-custom-tooltip">
                        <p style={{ color: '#666' }}>{`Week ${label}`}</p>
                        <p style={{ color: '#666' }}>{`0 lb`}</p>
                      </div>
                    );
                  }

                  const filteredPayload = payload.filter(
                    (entry) => entry.value > 0
                  );

                  return (
                    <div className="report-custom-tooltip">
                      <p style={{ color: '#666', marginBottom: '5px' }}>{`Week ${label}`}</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxWidth: '300px' }}>
                        {filteredPayload.map((entry, index) => (
                          <span key={index} style={{ 
                            color: entry.color,
                            whiteSpace: 'nowrap'
                          }}>
                            {`${entry.name}: ${entry.value} lb${index < filteredPayload.length - 1 ? ',' : ''}`}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                }}
              />
              <Legend
                verticalAlign='bottom'
                height={36}
                wrapperStyle={{ marginTop: 10 }}
              />
              {itemChartData.items.map((itemName, index) => {
                const hasData = itemChartData.incoming.some(
                  (data) => data[itemName] > 0
                );
                if (!hasData && itemName !== 'No Data') return null;

                if (!incomingColorsMap[itemName]) {
                  incomingColorsMap[itemName] =
                    incomingColors[index % incomingColors.length];
                }

                return (
                  <Line
                    key={itemName}
                    type='monotone'
                    dataKey={itemName}
                    stroke={incomingColorsMap[itemName]}
                    name={itemName}
                    isAnimationActive={false}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="graph-box">
          <h3 className='chart-title'>Outgoing Items</h3>
          <ResponsiveContainer width='100%' height={320}>
            <LineChart data={itemChartData.outgoing}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis
                dataKey='weekNumber'
                tickFormatter={(index) => `Week ${index}`}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                domain={[0, 'auto']}
                label={{
                  value: 'Quantity',
                  angle: -90,
                  position: 'insideLeft',
                  fontSize: 13,
                }}
                tick={{ fontSize: 12 }}
                allowDataOverflow={false}
                tickFormatter={(value) => `${value} lb`}
              />
              <Tooltip
                labelFormatter={(label) => `Week ${label}`}
                content={({ payload, label }) => {
                  if (!payload || payload.length === 0) {
                    return (
                      <div className="report-custom-tooltip">
                        <p style={{ color: '#666' }}>{`Week ${label}`}</p>
                        <p style={{ color: '#666' }}>{`No Data`}</p>
                      </div>
                    );
                  }

                  const totalValue = payload.reduce(
                    (sum, entry) => sum + (entry.value || 0),
                    0
                  );

                  if (totalValue === 0) {
                    return (
                      <div className="report-custom-tooltip">
                        <p style={{ color: '#666' }}>{`Week ${label}`}</p>
                        <p style={{ color: '#666' }}>{`0 lb`}</p>
                      </div>
                    );
                  }

                  const filteredPayload = payload.filter(
                    (entry) => entry.value > 0
                  );

                  return (
                    <div className="report-custom-tooltip">
                      <p style={{ color: '#666', marginBottom: '5px' }}>{`Week ${label}`}</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxWidth: '300px' }}>
                        {filteredPayload.map((entry, index) => (
                          <span key={index} style={{ 
                            color: entry.color,
                            whiteSpace: 'nowrap'
                          }}>
                            {`${entry.name}: ${entry.value} lb${index < filteredPayload.length - 1 ? ',' : ''}`}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                }}
              />
              <Legend
                verticalAlign='bottom'
                height={36}
                wrapperStyle={{ marginTop: 10 }}
              />
              {itemChartData.items.map((itemName, index) => {
                const hasData = itemChartData.outgoing.some(
                  (data) => data[itemName] > 0
                );
                if (!hasData && itemName !== 'No Data') return null;

                if (!outgoingColorsMap[itemName]) {
                  outgoingColorsMap[itemName] =
                    outgoingColors[index % outgoingColors.length];
                }

                return (
                  <Line
                    key={itemName}
                    type='monotone'
                    dataKey={itemName}
                    stroke={outgoingColorsMap[itemName]}
                    name={itemName}
                    isAnimationActive={false}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Report;
