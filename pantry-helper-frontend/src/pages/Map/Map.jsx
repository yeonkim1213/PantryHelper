import React, { useState, useEffect } from 'react';
import GridLayout from 'react-grid-layout';
import { Modal, Button, Input, Select, message } from 'antd';
import { fetchInventory } from '../../services/inventoryService'; // Update with your service path
import { fetchPantryUsers } from '../../services/pantryUserService';
import { useProfile } from '../../context/ProfileContext';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './Map.css';
import { saveMapLayout, fetchMapLayout } from '../../services/mapService'; // Import both services

const { Option } = Select;

const Map = () => {
  const [layout, setLayout] = useState([]);
  const [boxes, setBoxes] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newBoxName, setNewBoxName] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [currentPantry, setCurrentPantry] = useState('');
  const [userAuthority, setUserAuthority] = useState('');

  const { profile } = useProfile();

  useEffect(() => {
    const fetchPantryUser = async () => {
      try {
        const response = await fetchPantryUsers();
        const pantryUsers = response.data;

        const currentAuthority = pantryUsers.find(
          (user) => user.profileID === profile?.profileID && user.pantryID === currentPantry
        )?.userAuthority;

        setUserAuthority(currentAuthority || null);
      } catch (error) {
        console.error('Error fetching pantry users:', error);
      }
    };

    if (profile && currentPantry) {
      fetchPantryUser();
    }
  }, [currentPantry, profile]);

  useEffect(() => {
    if (profile) {
      setCurrentPantry(profile.currentPantry);
    }
    if (currentPantry) {
      // Clear the previous layout and boxes to avoid overlapping
      setLayout([]);
      setBoxes([]);
      loadInventory();
    }
  }, [profile, currentPantry]);

  useEffect(() => {
    if (inventory.length > 0 && currentPantry) {
      loadMapLayout(); // Only call loadMapLayout after inventory is loaded
    }
  }, [inventory, currentPantry]);

  const loadInventory = async () => {
    try {
      const response = await fetchInventory(currentPantry);
      setInventory(response.data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  const loadMapLayout = async () => {
    try {
      const response = await fetchMapLayout(currentPantry);
      const savedLayout = response.data;

      // Transform saved layout into the expected format for GridLayout
      const formattedLayout = savedLayout.map((box) => ({
        i: box.boxID,
        x: box.x,
        y: box.y,
        w: box.w,
        h: box.h,
      }));

      const formattedBoxes = savedLayout.map((box) => ({
        i: box.boxID,
        name: box.name,
        item: inventory.find((item) => item.id === box.itemID) || {},
      }));

      setLayout(formattedLayout);
      setBoxes(formattedBoxes);
    } catch (error) {
      console.error('Error loading map layout:', error);
    }
  };

  const handleSave = async () => {
    try {
      const formattedLayout = layout.map((box) => ({
        boxID: box.i,
        x: box.x,
        y: box.y,
        w: box.w,
        h: box.h,
        name: boxes.find((b) => b.i === box.i)?.name || '',
        itemID: boxes.find((b) => b.i === box.i)?.item.id || null,
      }));
  
      await saveMapLayout(currentPantry, formattedLayout);
      message.success('Layout saved successfully!');
    } catch (error) {
      console.error('Error saving layout:', error);
      message.error('Failed to save layout.');
    }
  };

  const findNextAvailablePosition = () => {
    const takenPositions = layout.map((box) => ({
      x: box.x,
      y: box.y,
      w: box.w,
      h: box.h,
    }));

    takenPositions.sort((a, b) => (a.y === b.y ? a.x - b.x : a.y - b.y));

    for (let y = 0; y < 100; y++) {
      for (let x = 0; x < 24; x++) {
        const positionOccupied = takenPositions.some(
          (box) =>
            x >= box.x &&
            x < box.x + box.w &&
            y >= box.y &&
            y < box.y + box.h
        );
        if (!positionOccupied) return { x, y };
      }
    }
    return { x: 0, y: 0 };
  };

  const handleAddBox = () => {
    if (!newBoxName || !selectedItem) {
      message.warning('Please fill in all fields.');
      return;
    }

      // Check if the box name already exists
  if (boxes.some((box) => box.name === newBoxName)) {
    message.error('A box with this name already exists. Please choose a different name.');
    return;
  }

    const { x, y } = findNextAvailablePosition();

    const newBox = {
      i: `${boxes.length}`,
      x,
      y,
      w: 2,
      h: 2,
      name: newBoxName,
      item: inventory.find((item) => item.id === selectedItem),
    };

    setBoxes([...boxes, newBox]);
    setLayout([...layout, newBox]);
    setModalVisible(false);
    setNewBoxName('');
    setSelectedItem(null);
  };

  const handleDeleteBox = (boxId) => {
    setBoxes(boxes.filter((box) => box.i !== boxId));
    setLayout(layout.filter((layoutItem) => layoutItem.i !== boxId));
  };

  const determineStockStatusColor = (quantity) => {
    if (quantity == 0) return '#F47174';
    if (quantity <= 10) return '#4fc0e3';
    return '#8ad142';
  };

  const availableItems = inventory.filter(
    (item) => !boxes.some((box) => box.item.id === item.id)
  );

  return (
    <div className="map-container">
      <div className="button-container">
        {userAuthority !== 'recipient' && (
          <>
            <Button type="primary" onClick={() => setModalVisible(true)}>
              Add Box
            </Button>
            <Button
              type="primary"
              onClick={handleSave}
            >
              Save
            </Button>
          </>
        )}
      </div>

      <GridLayout
        className="layout"
        layout={layout}
        cols={24}
        rowHeight={50}
        width={2400}
        isResizable={userAuthority !== 'recipient'} // Allow resizing only if not recipient
        isDraggable={userAuthority !== 'recipient'} // Allow dragging only if not recipient
        resizeHandles={userAuthority !== 'recipient' ? ['se'] : []} // Show resize handles only if not recipient
        preventCollision
        compactType={null}
        style={{
          backgroundColor: '#ffffff',
          height: '70vh',
          width: '100%',
          overflow: 'hidden',
          border: '2px solid #ccc',
        }}
        onLayoutChange={(newLayout) => {
          if (userAuthority !== 'recipient') {
            setLayout(newLayout); // Update layout only if not recipient
          }
        }}
      >
        {boxes.map((box) => (
          <div key={box.i} className="grid-box">
            {userAuthority !== 'recipient' && (
              <button
                className="delete-box-btn"
                onClick={() => handleDeleteBox(box.i)}
                style={{
                  position: 'absolute',
                  top: 1,
                  right: 1,
                  background: '#f9f9f9',
                  color: 'red',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                X
              </button>
            )}
            <div
              className="stock-indicator"
              style={{
                backgroundColor: determineStockStatusColor(box.item.Quantity),
              }}
            ></div>
            <h4 className="box-title">{box.name}</h4>
            <p className="item-name">{box.item.Name}</p>
          </div>
        ))}
      </GridLayout>
      <Modal
        title="Add Box"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="add" type="primary" onClick={handleAddBox}>
            Add
          </Button>,
        ]}
      >
        <Input
          placeholder="Box Name"
          value={newBoxName}
          onChange={(e) => setNewBoxName(e.target.value)}
          style={{ marginBottom: '10px' }}
        />
        <Select
          placeholder="Select an Item"
          style={{ width: '100%' }}
          value={selectedItem}
          onChange={(value) => setSelectedItem(value)}
        >
          {availableItems.map((item) => (
            <Option key={item.id} value={item.id}>
              {item.Name}
            </Option>
          ))}
        </Select>
      </Modal>
    </div>
  );
};

export default Map;
