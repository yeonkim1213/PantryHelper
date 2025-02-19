import React, { useState } from 'react';
import { Modal, Button, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import pdfToText from 'react-pdftotext';
import * as XLSX from 'xlsx';
import { addItem } from '../../../services/inventoryService';

const BatchUploadModal = ({ visible, onClose, pantryID, reloadInventory }) => {
  const [fileList, setFileList] = useState([]);

  const handleFileUpload = async () => {
    if (!fileList.length) {
      message.warning("Please select a file before uploading.");
      return;
    }

    const file = fileList[0];
    if (file.type === "application/pdf") {
      await handlePdfUpload(file);
    } else if (file.type === "text/plain") {
      await handleTxtUpload(file);
    } else if (file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || file.type === "application/vnd.ms-excel") {
      await handleExcelUpload(file);
    } else {
      message.error("Unsupported file type. Please upload a PDF, TXT, or Excel file.");
    }
  };

  const handleTxtUpload = async (file) => {
    const text = await file.text();
    const items = parseTextFile(text);
    await batchUploadItems(items);
    reloadInventory();
  };

  const handlePdfUpload = async (file) => {
    try {
      const text = await pdfToText(file);
      const items = parseTextFile(text);
      await batchUploadItems(items);
      reloadInventory();
    } catch (error) {
      message.error("Failed to extract text from PDF.");
      console.error("PDF extraction error:", error);
    }
  };

  const handleExcelUpload = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    const items = sheetData.map((row) => {
      const [Name, Quantity, IncomingDate, ExpirationDate] = row;

      const excelDateToJSDate = (serial) => {
        const excelEpoch = new Date(Date.UTC(1899, 11, 30)); // Excel epoch starts at 1899-12-30
        const utcDays = serial; // Adjust for Excel's date offset
        const msPerDay = 24 * 60 * 60 * 1000;
        const utcDate = new Date(excelEpoch.getTime() + utcDays * msPerDay); // Convert serial to UTC date
      
        // Adjust to local time to ensure the correct date
        const localDate = new Date(utcDate.getUTCFullYear(), utcDate.getUTCMonth(), utcDate.getUTCDate());
        return localDate.toISOString().split('T')[0]; // Return in YYYY-MM-DD format
      };
      
      return {
        name: Name.trim(),
        quantity: parseInt(Quantity, 10),
        incomingDate: typeof IncomingDate === 'number' ? excelDateToJSDate(IncomingDate) : null,
        expirationDate:typeof ExpirationDate === 'number' ? excelDateToJSDate(ExpirationDate) : null,
      };
    }).filter(item => item.name && item.quantity && item.incomingDate); // Filter out empty rows

    await batchUploadItems(items);
  };

  const parseTextFile = (text) => {
    const items = [];
    const regex = /([^,]+),\s*(\d+),\s*(\d{4}-\d{2}-\d{2})(?:,\s*(\d{4}-\d{2}-\d{2}))?/g;
    
    let match;
    while ((match = regex.exec(text)) !== null) {
      const [_, Name, Quantity, IncomingDate, ExpirationDate] = match;

      items.push({
        name: Name.trim(),
        quantity: parseInt(Quantity, 10),
        incomingDate: IncomingDate ? (IncomingDate) : null,
        expirationDate:  ExpirationDate ? (ExpirationDate) : null,
      });
    }
    
    return items;
  };

  const batchUploadItems = async (items) => {
    try {
      const uploadPromises = items.map((item) => addItem(item, pantryID));
      await Promise.all(uploadPromises);
      message.success("Batch update successful!");
      onClose();
      reloadInventory();
    } catch (error) {
      message.error("Batch update failed.");
      console.error("Batch upload error:", error);
    }
  };

  return (
    <Modal
      title="Batch Update Inventory"
      visible={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="upload" type="primary" onClick={handleFileUpload}>
          Upload
        </Button>
      ]}
    >
      <Upload
        beforeUpload={(file) => {
          setFileList([file]);
          return false;
        }}
        fileList={fileList}
        onRemove={() => setFileList([])}
      >
        <Button icon={<UploadOutlined />}>Select File</Button>
      </Upload>
      <p>Upload a TXT, PDF, or Excel (xlsx) file with items in the format:</p>
      <pre>
        {`Name, Quantity, Incoming Date, Expiration Date
Example:
Apples, 25, 2023-11-01, 2023-12-01
Oranges, 30, 2023-11-02, 2023-12-13`}
      </pre>
    </Modal>
  );
};

export default BatchUploadModal;
