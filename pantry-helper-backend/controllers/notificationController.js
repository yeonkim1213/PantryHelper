const pool = require('../db');

exports.fetchAllNotifications = (req, res) => {

  const query = `SELECT * FROM Notifications`;

  pool.query(query, (error, results) => {
    if (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).send('Error fetching notifications');
    } else {
      res.json(results);
    }
  });
};


// Get all notifications for a specific profile ID
exports.fetchNotifications = (req, res) => {
  const { profileID } = req.params;

  const query = `SELECT * FROM Notifications WHERE profileID = ? ORDER BY createdAt DESC`;

  pool.query(query, [profileID], (error, results) => {
    if (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).send('Error fetching notifications');
    } else {
      res.json(results);
    }
  });
};

// Add a new notification
exports.addNotification = (req, res) => {
  console.log('Request Body:', req.body);
  const { profileID, pantryID, detail, isRead = false } = req.body;

  const query = `INSERT INTO Notifications (profileID, pantryID, detail, isRead) VALUES (?, ?, ?, ?)`;

  pool.query(query, [profileID, pantryID, detail, isRead], (error, results) => {
    if (error) {
      console.error('Error adding notification:', error);
      res.status(500).send('Error adding notification');
    } else {
      res.status(201).json({ message: 'Notification added successfully', id: results.insertId });
    }
  });
};

// Delete a notification by ID
exports.deleteNotificationByID = (req, res) => {
  const { notificationID } = req.params;

  const query = `DELETE FROM Notifications WHERE notificationID = ?`;

  pool.query(query, [notificationID], (error, results) => {
    if (error) {
      console.error('Error deleting notification:', error);
      res.status(500).send('Error deleting notification');
    } else if (results.affectedRows === 0) {
      res.status(404).send('Notification not found');
    } else {
      res.json({ message: 'Notification deleted successfully' });
    }
  });
};

// Mark a notification as read
exports.markNotificationAsRead = (req, res) => {
  const { profileID } = req.params;

  const query = `UPDATE Notifications SET isRead = TRUE WHERE profileID = ?`;

  pool.query(query, [profileID], (error, results) => {
    if (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).send('Error marking notification as read');
    } else if (results.affectedRows === 0) {
      res.json({ message: 'No notification' });
    } else {
      res.json({ message: 'Notification marked as read successfully' });
    }
  });
};