import React, { useState } from 'react';
import { Modal, Form, InputNumber, Button, DatePicker } from 'antd';

const OutgoingItemModal = ({ open, selectedItems = [], onCancel, onConfirm }) => {
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
      title="Outgoing Items"
      open={open}
      onOk={handleSubmit}
      onCancel={onCancel}
      okText="Confirm"
      cancelText="Cancel"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="outgoingDate"
          label="Outgoing Date"
          rules={[{ required: true, message: 'Please select the outgoing date!' }]}
        >
          <DatePicker />
        </Form.Item>

        {selectedItems && selectedItems.length > 0 ? (
          selectedItems.map(item => (
            <Form.Item
              key={item.id}
              name={`quantity_${item.id}`}
              label={`${item.Name} - Outgoing Quantity`}
              rules={[{ required: true, message: 'Please input the quantity!' }]}
            >
              <InputNumber min={1} max={item.Quantity} initialValue={1} />
            </Form.Item>
          ))
        ) : (
          <p>No items selected</p>
        )}
      </Form>
    </Modal>
  );
};

export default OutgoingItemModal;
