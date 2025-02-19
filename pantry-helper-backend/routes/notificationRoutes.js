const express = require('express');
const router = express.Router();
const {
  fetchNotifications,
  addNotification,
  deleteNotificationByID,
  markNotificationAsRead,
  fetchAllNotifications,
} = require('../controllers/notificationController');

router.get('/', fetchAllNotifications);

/**
 * @swagger
 * /api/notifications/{profileID}:
 *   get:
 *     summary: Get all notifications for a profile
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: profileID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of notifications for the profile
 *       404:
 *         description: Profile not found
 *       500:
 *         description: Error retrieving notifications
 */
router.get('/:profileID', fetchNotifications);

/**
 * @swagger
 * /api/notifications:
 *   post:
 *     summary: Create a new notification
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - profileID
 *               - detail
 *             properties:
 *               profileID:
 *                 type: integer
 *               pantryID:
 *                 type: integer
 *               detail:
 *                 type: string
 *               isRead:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: Notification created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Error adding notification
 */
router.post('/', addNotification);

/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     summary: Delete a notification by ID
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Error deleting notification
 */
router.delete('/:notificationID', deleteNotificationByID);

/**
 * @swagger
 * /api/notifications/{id}/mark-as-read:
 *   patch:
 *     summary: Mark a notification as read
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marked as read successfully
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Error updating notification
 */
router.patch('/:profileID', markNotificationAsRead);

module.exports = router;