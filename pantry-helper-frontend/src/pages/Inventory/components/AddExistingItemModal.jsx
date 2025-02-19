import React, { useState } from 'react';
import { Modal, Form, InputNumber, Button, DatePicker } from 'antd';

const AddExistingItemModal = ({ open, selectedItems = [], onCancel, onConfirm }) => {
  const [form] = Form.useForm();

  const handleSubmit = () => {
    form.validateFields()
      .then(values => {
        onConfirm(values);
        form.resetFields();
      })
      .catch(info => {
        console.log('Validate Failed:', info);
      });
  };

  return (
    <Modal
      title="Incoming Items"
      open={open}
      onOk={handleSubmit}
      onCancel={onCancel}
      okText="Confirm"
      cancelText="Cancel"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="incomingDate"
          label="Incoming Date"
          rules={[{ required: true, message: 'Please input the incoming date!' }]}
        >
          <DatePicker />
        </Form.Item>

        <Form.Item
          name="expirationDate"
          label="Expiration Date"
        >
          <DatePicker />
        </Form.Item>

        {selectedItems && selectedItems.length > 0 ? (
          selectedItems.map(item => (
            <Form.Item
              key={item.id}
              name={`quantity_${item.id}`}
              label={`${item.Name} - Incoming Quantity`}
              rules={[{ required: true, message: 'Please input the quantity!' }]}
            >
              <InputNumber min={1} initialValue={1} />
            </Form.Item>
          ))
        ) : (
          <p>No items selected</p>
        )}
      </Form>
    </Modal>
  );
};

export default AddExistingItemModal;
