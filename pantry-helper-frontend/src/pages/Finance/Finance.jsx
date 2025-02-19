import React, { useEffect, useState } from 'react'
import {
  Table,
  Modal,
  Input,
  Form,
  Select,
  DatePicker,
  Button,
  Alert,
  Spin,
  Space,
  message,
  Tooltip
} from 'antd'
import {
  getFinanceRecords,
  addFinanceRecord,
  updateFinanceRecord,
  deleteFinanceRecord
} from '../../services/financeService'
import { useProfile } from '../../context/ProfileContext'
import './Finance.css'
import moment from 'moment'
import { SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'

const { Option } = Select

const Finance = () => {
  const { profile } = useProfile()
  const [financeRecords, setFinanceRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [searchText, setSearchText] = useState('')

  const [selectedRowKeysIncome, setSelectedRowKeysIncome] = useState([])
  const [selectedRowKeysExpense, setSelectedRowKeysExpense] = useState([])

  const [editRecord, setEditRecord] = useState(null)

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
    { name: 'December', value: 11 }
  ]

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i) // Last 10 years

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(currentYear)

  const [form] = Form.useForm();

  useEffect(() => {
    if (profile?.currentPantry) {
      fetchFinanceRecords(profile.currentPantry)
    }
  }, [profile?.currentPantry])

  const fetchFinanceRecords = async pantryID => {
    setLoading(true)
    try {
      const response = await getFinanceRecords(pantryID)
      setFinanceRecords(response.data)
    } catch (error) {
      console.error('Error fetching finance records:', error)
      setError('Failed to load finance records.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddFinance = async values => {
    try {
      const data = {
        ...values,
        transactionDate: values.transactionDate.format('YYYY-MM-DD')
      }

      if (editRecord) {
        await updateFinanceRecord(editRecord.id, data)
        setEditRecord(null)
        message.success('Finance record updated successfully')
      } else {
        await addFinanceRecord(profile.currentPantry, data)
        message.success('Finance record added successfully')
      }
      setIsModalVisible(false)
      fetchFinanceRecords(profile.currentPantry)
    } catch (error) {
      console.error('Error adding/updating finance record:', error)
      setError('Failed to add/update finance record.')
    }
  }

  const handleDelete = async id => {
    try {
      await deleteFinanceRecord(id)
      fetchFinanceRecords(profile.currentPantry)
      message.success('Finance record deleted successfully')
    } catch (error) {
      console.error('Error deleting finance record:', error)
      setError('Failed to delete finance record.')
    }
  }

  const handleDeleteSelected = async () => {
    try {
      const allSelectedKeys = [
        ...selectedRowKeysIncome,
        ...selectedRowKeysExpense
      ]
      for (const id of allSelectedKeys) {
        await deleteFinanceRecord(id)
      }
      setSelectedRowKeysIncome([])
      setSelectedRowKeysExpense([])
      fetchFinanceRecords(profile.currentPantry)
      message.success(
        isAllSelected
          ? 'All finance records deleted successfully'
          : 'Selected finance records deleted successfully'
      )
    } catch (error) {
      console.error('Error deleting selected finance records:', error)
      setError('Failed to delete selected finance records.')
    }
  }

  const handleEdit = record => {
    setEditRecord({
      ...record,
      transactionDate: moment(record.transactionDate)
    })
    setIsModalVisible(true)
  }

  const handleSearch = e => {
    setSearchText(e.target.value)
  }

  const handleMonthChange = value => {
    setSelectedMonth(value)
  }

  const handleYearChange = value => {
    setSelectedYear(value)
  }

  const filterRecords = records => {
    const search = searchText.toLowerCase()
    return records.filter(record => {
      const recordDate = new Date(record.transactionDate)
      const matchesSearch =
        record.description?.toLowerCase().includes(search) ||
        record.amount.toString().includes(search) ||
        moment(recordDate).format('YYYY-MM-DD').includes(search)

      const matchesMonthYear =
        recordDate.getMonth() === selectedMonth &&
        recordDate.getFullYear() === selectedYear

      return matchesSearch && matchesMonthYear
    })
  }

  const incomeRecords = financeRecords.filter(
    record => record.transactionType === 'Income'
  )
  const expenseRecords = financeRecords.filter(
    record => record.transactionType === 'Expense'
  )

  const filteredIncomeRecords = filterRecords(incomeRecords)
  const filteredExpenseRecords = filterRecords(expenseRecords)

  const sortByDateAsc = (a, b) =>
    new Date(a.transactionDate) - new Date(b.transactionDate)

  const sortedIncomeRecords = [...filteredIncomeRecords].sort(sortByDateAsc)
  const sortedExpenseRecords = [...filteredExpenseRecords].sort(sortByDateAsc)

  const totalRecords = sortedIncomeRecords.length + sortedExpenseRecords.length
  const totalSelected =
    selectedRowKeysIncome.length + selectedRowKeysExpense.length
  const isAllSelected = totalRecords > 0 && totalSelected === totalRecords

  const hasSelected = totalSelected > 0

  const columns = [
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: text => `$${text}`
    },
    {
      title: 'Date',
      dataIndex: 'transactionDate',
      key: 'transactionDate',
      render: date => moment(date).format('YYYY-MM-DD')
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: text => {
        if (text && text.length > 30) {
          return <Tooltip title={text}>{text.substring(0, 27) + '...'}</Tooltip>
        } else {
          return text
        }
      }
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size='middle'>
          <EditOutlined
            className='action-icon edit-icon'
            onClick={() => handleEdit(record)}
          />
          <DeleteOutlined
            className='action-icon delete-icon'
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      )
    }
  ]

  const rowSelectionIncome = {
    selectedRowKeys: selectedRowKeysIncome,
    onChange: selectedKeys => setSelectedRowKeysIncome(selectedKeys)
  }

  const rowSelectionExpense = {
    selectedRowKeys: selectedRowKeysExpense,
    onChange: selectedKeys => setSelectedRowKeysExpense(selectedKeys)
  }

  return (
    <div className='finance-container'>
      {error && (
        <Alert
          message='Error'
          description={error}
          type='error'
          showIcon
          closable
          onClose={() => setError(null)}
        />
      )}

      <div className='finance-header'>
        <div className='finance-header-left'>
          <Space>
            <Input
              placeholder='Search'
              value={searchText}
              onChange={handleSearch}
              style={{ width: 200 }}
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
              style={{ width: 100 }}
            >
              {years.map(year => (
                <Option key={year} value={year}>
                  {year}
                </Option>
              ))}
            </Select>
          </Space>
        </div>
        <div className='finance-header-right'>
          {hasSelected && (
            <Button 
              danger 
              onClick={handleDeleteSelected}
              style={{ width: 100 }}
            >
              Delete ({totalSelected})
            </Button>
          )}
          <Button
            type='primary'
            onClick={() => {
              setEditRecord(null);
              setIsModalVisible(true);
              form.resetFields();
            }}
          >
            Add Finance Record
          </Button>
        </div>
      </div>

      {loading ? (
         <div style={{ textAlign: 'center', padding: '50px' }}>
       
       </div>
      ) : (
        <div className='finance-tables-container'>
          <div className='finance-table'>
            <h4>Income</h4>
            <Table
              columns={columns}
              dataSource={sortedIncomeRecords}
              rowKey='id'
              pagination={{ pageSize: 8, position: ['bottomCenter'] }}
              rowSelection={rowSelectionIncome}
              bordered
            />
          </div>
          <div className='finance-table'>
            <h4>Expense</h4>
            <Table
              columns={columns}
              dataSource={sortedExpenseRecords}
              rowKey='id'
              pagination={{ pageSize: 8, position: ['bottomCenter'] }}
              rowSelection={rowSelectionExpense}
              bordered
            />
          </div>
        </div>
      )}

      <Modal
        title={editRecord ? 'Edit Finance Record' : 'Add Finance Record'}
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleAddFinance}
          layout='vertical'
          initialValues={
            editRecord
              ? {
                  transactionType: editRecord.transactionType,
                  amount: editRecord.amount,
                  transactionDate: editRecord.transactionDate,
                  description: editRecord.description
                }
              : {}
          }
        >
          <Form.Item
            name='transactionType'
            label='Transaction Type'
            rules={[{ required: true }]}
          >
            <Select placeholder='Select transaction type'>
              <Option value='Income'>Income</Option>
              <Option value='Expense'>Expense</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name='amount'
            label='Amount'
            rules={[{ required: true, message: 'Please enter the amount' }]}
          >
            <Input type='number' prefix='$' />
          </Form.Item>
          <Form.Item
            name='transactionDate'
            label='Date'
            rules={[{ required: true }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name='description' label='Description'>
            <Input.TextArea rows={3} maxLength={200} />
          </Form.Item>
          <Form.Item>
            <Button type='primary' htmlType='submit' block>
              {editRecord ? 'Update Record' : 'Add Record'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Finance
