import React, { useEffect, useState } from 'react';
import { getFinanceRecords } from '../../services/financeService';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer, Label, AreaChart, BarChart, Bar, Area
} from 'recharts';
import { DatePicker, Row, Col, Card, Spin, Alert, Table, Input, Space, Select, Button } from 'antd';
import { useProfile } from '../../context/ProfileContext';
import moment from 'moment';
import './ReportFinance.css';

const { RangePicker } = DatePicker;
const { Option } = Select;

const ReportFinance = () => {
  const { profile } = useProfile();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchData = async () => {
      if (profile?.currentPantry) {
        setLoading(true);
        try {
          const response = await getFinanceRecords(profile.currentPantry);
          const records = response.data.map(record => ({
            ...record,
            transactionDate: moment(record.transactionDate).format('YYYY-MM-DD')
          }));
          setTransactions(records);
        } catch (err) {
          console.error('Error fetching finance records:', err);
          setError('Failed to load finance records.');
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [profile?.currentPantry]);

  // Get filtered transactions based on selected month and year
  const getFilteredTransactions = () => {
    return transactions.filter(transaction => {
      const date = new Date(transaction.transactionDate);
      return date.getMonth() === selectedMonth && 
             date.getFullYear() === selectedYear;
    });
  };

  const totalIncome = getFilteredTransactions().reduce((acc, d) => acc + d.amount, 0);
  const totalExpense = getFilteredTransactions().reduce((acc, d) => acc + d.amount, 0);

  // Your original pie chart functions
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Your original data processing
  const processChartData = () => {
    const filteredTransactions = getFilteredTransactions();
    
    // Process pie chart data
    let totalIncome = 0;
    let totalExpense = 0;
    
    filteredTransactions.forEach(transaction => {
      if (transaction.transactionType === 'Income') {
        totalIncome += transaction.amount;
      } else {
        totalExpense += transaction.amount;
      }
    });

    return {
      pieData: [
        { name: 'Income', value: totalIncome },
        { name: 'Expense', value: totalExpense }
      ],
      barData: filteredTransactions.map(transaction => ({
        name: new Date(transaction.transactionDate).toLocaleDateString(),
        Income: transaction.transactionType === 'Income' ? transaction.amount : 0,
        Expense: transaction.transactionType === 'Expense' ? transaction.amount : 0
      }))
    };
  };

  // Constants for pie chart
  const COLORS = ['#4fc0e3', '#ff7f7f'];
  const RADIAN = Math.PI / 180;

  // Get all the processed data
  const chartData = processChartData();
  const { pieData, barData } = chartData;

  const processNetIncomeData = () => {
    const filteredTransactions = getFilteredTransactions();
    
    // Create a map of daily net income
    const dailyNetIncome = {};
    
    filteredTransactions.forEach(transaction => {
      const date = transaction.transactionDate;
      if (!dailyNetIncome[date]) {
        dailyNetIncome[date] = 0;
      }
      dailyNetIncome[date] += transaction.transactionType === 'Income' 
        ? transaction.amount 
        : -transaction.amount;
    });

    // Convert to array and sort by date
    return Object.entries(dailyNetIncome)
      .map(([date, netIncome]) => ({
        date,
        netIncome
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const processMonthlyTrendData = () => {
    // Create array of last 12 months
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const monthDate = moment([selectedYear, selectedMonth]).subtract(i, 'months');
      months.push(monthDate.format('MMM'));
    }

    // Initialize monthly totals with all months
    const monthlyTotals = months.reduce((acc, month) => {
      acc[month] = {
        month,
        income: 0,
        expense: 0
      };
      return acc;
    }, {});

    // Get date range for filtering transactions
    const endDate = moment([selectedYear, selectedMonth]).endOf('month');
    const startDate = moment(endDate).subtract(11, 'months').startOf('month');

    // Filter and process transactions
    const yearlyTransactions = transactions.filter(transaction => {
      const transDate = moment(transaction.transactionDate);
      return transDate.isBetween(startDate, endDate, 'month', '[]');
    });

    // Fill in the actual values
    yearlyTransactions.forEach(transaction => {
      const month = moment(transaction.transactionDate).format('MMM');
      if (transaction.transactionType === 'Income') {
        monthlyTotals[month].income += transaction.amount;
      } else {
        monthlyTotals[month].expense += transaction.amount;
      }
    });

    // Convert to array maintaining the order
    return months.map(month => monthlyTotals[month]);
  };

  // Update processBarChartData to show more recent transactions first
  const processBarChartData = (transactions) => {
    const dailyTotals = transactions.reduce((acc, transaction) => {
      const date = transaction.transactionDate;
      if (!acc[date]) {
        acc[date] = { Income: 0, Expense: 0 };
      }
      if (transaction.transactionType === 'Income') {
        acc[date].Income += transaction.amount;
      } else {
        acc[date].Expense += transaction.amount;
      }
      return acc;
    }, {});

    return Object.entries(dailyTotals)
      .map(([date, totals]) => ({
        name: moment(date).format('MM/DD'),
        ...totals
      }))
      .sort((a, b) => moment(b.name, 'MM/DD') - moment(a.name, 'MM/DD'))
      .slice(0, 7)
      .reverse();
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
      
    </div>
    );
  }

  if (error) {
    return (
      <div className="report-finance-container">
        <Alert message="Error" description={error} type="error" showIcon />
      </div>
    );
  }

  return (
    <div className="report-finance">
      <div className="report-finance-content">
        <div id='finance-filter-container'>
          <div className='finance-filter-left'>
            <Space>
              <Select
                value={selectedMonth}
                onChange={setSelectedMonth}
                style={{ width: 120 }}
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <Option key={i} value={i}>
                    {new Date(2000, i, 1).toLocaleString('default', { month: 'long' })}
                  </Option>
                ))}
              </Select>
              <Select
                value={selectedYear}
                onChange={setSelectedYear}
                style={{ width: 100 }}
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - i;
                  return <Option key={year} value={year}>{year}</Option>;
                })}
              </Select>
            </Space>
          </div>
          <Button 
            onClick={() => {
              setSelectedMonth(new Date().getMonth());
              setSelectedYear(new Date().getFullYear());
            }}
          >
            Reset Filters
          </Button>
        </div>
        <div id='finance-charts-wrapper'>
          {/* First Row - Transaction History and Pie Chart */}
          <div id='finance-charts-row-1'>
            <div className='finance-chart-item'>
              <h3 className='finance-chart-title'>Transaction History</h3>
              <div id="finance-transaction-history-chart">
                <TransactionHistoryChart 
                  data={processBarChartData(getFilteredTransactions())}
                />
              </div>
            </div>
            <div className='finance-chart-item'>
              <h3 className='finance-chart-title'>Income vs Expense</h3>
              <div id="finance-pie-chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    {pieData.length && pieData.some(d => d.value > 0) ? (
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    ) : (
                      <>
                        <text
                          x="50%"
                          y="50%"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="#666"
                        >
                          No data
                        </text>
                      </>
                    )}
                    <Tooltip 
                      formatter={(value) => `$${value}`}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Second Row - Net Income and Monthly Trend */}
          <div id='finance-charts-row-2'>
            <div className='finance-chart-item'>
              <h3 className='finance-chart-title'>Net Income Over Time</h3>
              <NetIncomeChart 
                data={processNetIncomeData()} 
                selectedYear={selectedYear}
                selectedMonth={selectedMonth}
              />
            </div>
            <div className='finance-chart-item'>
              <h3 className='finance-chart-title'>Monthly Income vs Expense</h3>
              <MonthlyTrendChart data={processMonthlyTrendData()} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportFinance;

// Data processing functions
const processMonthlyTrends = (transactions) => {
  const monthlyData = {};
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.transactionDate);
    const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyData[monthYear]) {
      monthlyData[monthYear] = { 
        income: 0, 
        expense: 0,
        month: new Date(date.getFullYear(), date.getMonth(), 1)
          .toLocaleDateString('en-US', { month: 'short' })
      };
    }
    
    if (transaction.transactionType === 'Income') {
      monthlyData[monthYear].income += transaction.amount;
    } else {
      monthlyData[monthYear].expense += transaction.amount;
    }
  });

  return Object.values(monthlyData)
    .sort((a, b) => new Date(b.month) - new Date(a.month))
    .slice(0, 3)
    .reverse();
};

const processNetIncome = (transactions, selectedMonth, selectedYear) => {
  const filteredTransactions = transactions.filter(transaction => {
    const date = new Date(transaction.transactionDate);
    return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
  });

  // Aggregate transactions by date
  const dailyTotals = filteredTransactions.reduce((acc, transaction) => {
    const date = transaction.transactionDate;
    if (!acc[date]) {
      acc[date] = 0;
    }
    acc[date] += transaction.transactionType === 'Income' ? transaction.amount : -transaction.amount;
    return acc;
  }, {});

  // Convert to array and sort by date
  let cumulative = 0;
  return Object.entries(dailyTotals)
    .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
    .map(([date, amount]) => {
      cumulative += amount;
      return {
        date,
        netIncome: cumulative
      };
    });
};

const processExpenseCategories = (transactions, selectedMonth, selectedYear) => {
  const categories = {};
  
  transactions
    .filter(t => {
      const date = new Date(t.transactionDate);
      return t.transactionType === 'Expense' && 
             date.getMonth() === selectedMonth && 
             date.getFullYear() === selectedYear;
    })
    .forEach(transaction => {
      const category = transaction.description || 'Uncategorized';
      categories[category] = (categories[category] || 0) + transaction.amount;
    });

  return Object.entries(categories)
    .map(([category, amount]) => ({ category, Amount: amount }))
    .sort((a, b) => b.Amount - a.Amount)
    .slice(0, 5);
};

// Chart Components
const MonthlyTrendChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={200}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis 
        dataKey="month" 
        tick={{ fontSize: 12 }}
        interval={0}
        tickFormatter={(value) => {
          // Ensure consistent 3-letter month abbreviation
          return value.substring(0, 3);
        }}
      />
      <YAxis 
        tickFormatter={(value) => `$${value}`}
        tick={{ fontSize: 12 }}
      />
      <Tooltip 
        formatter={(value) => `$${value}`}
        labelFormatter={(label) => label}
        content={({ active, payload, label }) => {
          if (active && payload && payload.length) {
            return (
              <div className="finance-tooltip">
                <p>{label}</p>
                <p style={{ color: '#4fc0e3' }}>{`Income: $${payload[0].value}`}</p>
                <p style={{ color: '#F47174' }}>{`Expense: $${payload[1].value}`}</p>
              </div>
            );
          }
          return null;
        }}
      />
      <Legend />
      <Line 
        type="monotone" 
        dataKey="income" 
        stroke="#4fc0e3" 
        name="Income"
        strokeWidth={2}
        dot={{ r: 4 }}
      />
      <Line 
        type="monotone" 
        dataKey="expense" 
        stroke="#F47174" 
        name="Expense"
        strokeWidth={2}
        dot={{ r: 4 }}
      />
    </LineChart>
  </ResponsiveContainer>
);

const NetIncomeChart = ({ data, selectedYear, selectedMonth }) => (
  <ResponsiveContainer width="100%" height={200}>
    <AreaChart data={data.length ? data : [
      { date: new Date(selectedYear, selectedMonth, 1).toISOString(), netIncome: 0, noData: true },
      { date: new Date(selectedYear, selectedMonth + 1, 0).toISOString(), netIncome: 0, noData: true }
    ]}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis 
        dataKey="date" 
        tickFormatter={date => new Date(date).toLocaleDateString('en-US', { 
          month: 'numeric', 
          day: 'numeric'
        })}
      />
      <YAxis tickFormatter={(value) => `$${value}`} />
      <Tooltip 
        content={({ active, payload }) => {
          if (active && payload && payload.length) {
            if (payload[0].payload.noData) {
              return (
                <div className="report-custom-tooltip">
                  <p style={{ color: '#666' }}>No data</p>
                </div>
              );
            }
            return (
              <div className="report-custom-tooltip">
                <p style={{ color: '#666' }}>{new Date(payload[0].payload.date).toLocaleDateString('en-US', { 
                  month: 'numeric', 
                  day: 'numeric'
                })}</p>
                <p style={{ color: '#8ad142' }}>{`Net Income: $${payload[0].value}`}</p>
              </div>
            );
          }
          return null;
        }}
      />
      <Legend />
      <Area 
        type="monotone" 
        dataKey="netIncome" 
        name="Net Income"
        stroke="#8ad142" 
        fill="#8ad142" 
      />
    </AreaChart>
  </ResponsiveContainer>
);

const truncateText = (text, maxLength = 15) => {
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

const ExpenseCategoriesChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={200}>
    <BarChart
      data={data.length ? 
        data.map(item => ({
          ...item,
          category: truncateText(item.category)
        })) 
        : [{ category: '', Amount: 0 }]}
      layout="vertical"
      margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis 
        type="number" 
        tickFormatter={(value) => `$${value}`}
        label={data.length ? null : { 
          value: 'No data', 
          position: 'center',
          dy: 15
        }}
        tick={data.length ? {} : { display: 'none' }}
      />
      <YAxis 
        type="category" 
        dataKey="category" 
        width={90}
        tick={data.length ? {} : { display: 'none' }}
      />
      <Tooltip 
        content={({ active, payload }) => {
          if (active && payload && payload.length) {
            if (!data.length) {
              return (
                <div className="report-custom-tooltip">
                  <p style={{ color: '#666' }}>No data</p>
                </div>
              );
            }
            const originalCategory = data.find(item => 
              truncateText(item.category) === payload[0].payload.category
            )?.category || payload[0].payload.category;
            
            return (
              <div className="report-custom-tooltip">
                <p style={{ color: '#666' }}>{originalCategory}</p>
                <p style={{ color: '#F47174' }}>{`Amount: $${payload[0].value}`}</p>
              </div>
            );
          }
          return null;
        }}
      />
      <Bar dataKey="Amount" fill="#ff7f7f" />
    </BarChart>
  </ResponsiveContainer>
);

// Add this component inside ReportFinance
const TransactionHistoryChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart
      data={data.length ? data : [
        { name: '', Income: 0, Expense: 0, noData: true },
        { name: '', Income: 0, Expense: 0, noData: true }
      ]}
      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis 
        dataKey="name" 
        tick={{ fontSize: 12 }}
        label={data.length ? null : { 
          position: 'center',
          dy: 15
        }}
      />
      <YAxis 
        tickFormatter={(value) => `$${value}`}
        tick={{ fontSize: 12 }}
      />
      <Tooltip
        content={({ active, payload }) => {
          if (active && payload && payload.length) {
            if (payload[0].payload.noData) {
              return (
                <div className="finance-tooltip">
                  <p>No data available</p>
                </div>
              );
            }
            return (
              <div className="finance-tooltip">
                <p>{payload[0].payload.name}</p>
                <p style={{ color: '#4fc0e3' }}>{`Income: $${payload[0].value}`}</p>
                <p style={{ color: '#ff7f7f' }}>{`Expense: $${payload[1].value}`}</p>
              </div>
            );
          }
          return null;
        }}
      />
      <Legend />
      <Bar dataKey="Income" fill="#4fc0e3" />
      <Bar dataKey="Expense" fill="#ff7f7f" />
    </BarChart>
  </ResponsiveContainer>
);

const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];
