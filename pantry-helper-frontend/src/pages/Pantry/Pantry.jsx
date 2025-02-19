import React, { useState, useEffect } from 'react';
import './Pantry.css';
import {
  Table,
  Modal,
  Input,
  Form,
  Button,
  Space,
  message,
  Tooltip,
  Alert,
  Spin
} from 'antd';
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined
} from '@ant-design/icons';
import {
  addPantry,
  fetchPantries,
  updatePantry,
  deletePantry,
} from '../../services/pantryService';

const Pantry = () => {
  const [pantries, setPantries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    loadPantries();
  }, []);

  const loadPantries = async () => {
    setLoading(true);
    try {
      const pantriesData = await fetchPantries();
      setPantries(pantriesData.data);
    } catch (error) {
      console.error('Error fetching pantries:', error);
      setError('Failed to fetch pantries.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editRecord) {
        await updatePantry(editRecord.pantryID, values);
        message.success('Pantry updated successfully');
      } else {
        const response = await addPantry(values);
        setPantries([...pantries, { pantryID: response.data.pantryID, ...values }]);
        message.success('Pantry added successfully');
      }
      setIsModalVisible(false);
      loadPantries();
    } catch (error) {
      console.error('Error saving pantry:', error);
      message.error('Failed to save pantry');
    }
  };

  const handleDelete = async (pantryID) => {
    try {
      await deletePantry(pantryID);
      loadPantries();
      message.success('Pantry deleted successfully');
    } catch (error) {
      console.error('Error deleting pantry:', error);
      message.error('Failed to delete pantry');
    }
  };

  const handleDeleteSelected = async () => {
    try {
      for (const pantryID of selectedRowKeys) {
        await deletePantry(pantryID);
      }
      loadPantries();
      message.success('Pantries deleted successfully');
    } catch (error) {
      console.error('Error deleting pantries:', error);
      message.error('Failed to delete pantries');
    }
  };

  const columns = [
    {
      title: 'Pantry ID',
      dataIndex: 'pantryID',
      key: 'pantryID',
      sorter: (a, b) => a.pantryID - b.pantryID,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: text => {
        if (text && text.length > 30) {
          return <Tooltip title={text}>{text.substring(0, 27) + '...'}</Tooltip>;
        }
        return text;
      }
    },
    {
      title: 'Access Code',
      dataIndex: 'accessCode',
      key: 'accessCode',
      sorter: (a, b) => a.accessCode.localeCompare(b.accessCode),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            className="action-icon edit-icon"
            onClick={() => {
              setEditRecord(record);
              form.setFieldsValue(record);
              setIsModalVisible(true);
            }}
          />
          <Button
            type="link"
            icon={<DeleteOutlined />}
            className="action-icon delete-icon"
            onClick={() => handleDelete(record.pantryID)}
          />
        </Space>
      ),
    },
  ];

  // Sort the pantries by pantryID by default
  const sortedPantries = [...pantries].sort((a, b) => a.pantryID - b.pantryID);

  const filteredPantries = sortedPantries.filter(pantry => 
    pantry.name.toLowerCase().includes(searchText.toLowerCase()) ||
    pantry.accessCode.toLowerCase().includes(searchText.toLowerCase()) ||
    pantry.pantryID.toString().includes(searchText)
  );

  return (
    <div className="pantry-container">
      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
        />
      )}

      <div className="pantry-header">
        <div className="pantry-header-left">
          <Space>
            <Input
              placeholder="Search pantries"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200 }}
              prefix={<SearchOutlined />}
            />
          </Space>
        </div>
        <div className="pantry-header-right">
          {selectedRowKeys.length > 0 && (
            <Button 
              danger 
              onClick={handleDeleteSelected}
              style={{ width: 100 }}
            >
              Delete ({selectedRowKeys.length})
            </Button>
          )}
          <Button
            type="primary"
            onClick={() => {
              setEditRecord(null);
              form.resetFields();
              setIsModalVisible(true);
            }}
          >
            Add Pantry Record
          </Button>
        </div>
      </div>

      {/* Pantries Table */}
      <div className="pantries-section">
        <Table
          columns={columns}
          dataSource={filteredPantries}
          rowKey="pantryID"
          loading={loading}
          error={error}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
          }}
          onRow={(record) => ({
            onClick: () => setSelectedRowKeys([]),
          })}
          pagination={{ 
            pageSize: 8, 
            position: ['bottomCenter'],
            showSizeChanger: true,
          }}
          bordered
        />
      </div>

      <Modal
        title={editRecord ? 'Edit Pantry' : 'Add New Pantry'}
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          initialValues={editRecord || {}}
        >
          <Form.Item
            name="name"
            label="Pantry Name"
            rules={[{ required: true, message: 'Please enter the pantry name' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="accessCode"
            label="Access Code"
            rules={[
              { required: true, message: 'Please enter the access code' },
              { max: 8, message: 'Access code cannot exceed 8 characters' },
              { min: 8, message: 'Access code must be 8 characters' }
            ]}
          >
            <Input maxLength={8} placeholder="Enter 8-digit access code" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {editRecord ? 'Update Pantry' : 'Add Pantry'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Pantry;
