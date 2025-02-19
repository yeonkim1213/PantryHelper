const express = require('express')
const router = express.Router()
const {
  getEventsByPantryID,
  addEvent,
  updateEvent,
  deleteEvent
} = require('../controllers/eventsController')

/**
 * @swagger
 * /api/events/pantry/{pantryID}:
 *   get:
 *     summary: Get events by pantry ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: pantryID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of events for the specified pantry
 *       500:
 *         description: Error fetching events
 */
router.get('/pantry/:pantryID', getEventsByPantryID)

/**
 * @swagger
 * /api/events:
 *   post:
 *     summary: Add a new event
 *     tags: [Events]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pantryID
 *               - EventTitle
 *               - IconPath
 *             properties:
 *               pantryID:
 *                 type: string
 *               EventTitle:
 *                 type: string
 *               EventDetail:
 *                 type: string
 *               IconPath:
 *                 type: string
 *               EventDate:
 *                 type: string
 *                 format: date-time
 *               EventLocation:
 *                 type: string
 *     responses:
 *       201:
 *         description: Event created successfully
 *       500:
 *         description: Error adding event
 */
router.post('/', addEvent)

/**
 * @swagger
 * /api/events/{eventID}:
 *   put:
 *     summary: Update an event
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: eventID
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - EventTitle
 *               - IconPath
 *             properties:
 *               EventTitle:
 *                 type: string
 *               EventDetail:
 *                 type: string
 *               IconPath:
 *                 type: string
 *               EventDate:
 *                 type: string
 *                 format: date-time
 *               EventLocation:
 *                 type: string
 *     responses:
 *       200:
 *         description: Event updated successfully
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: Event not found
 *       500:
 *         description: Error updating event
 */
router.put('/:eventID', updateEvent)

/**
 * @swagger
 * /api/events/{eventID}:
 *   delete:
 *     summary: Delete an event
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: eventID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *       404:
 *         description: Event not found
 *       500:
 *         description: Error deleting event
 */
router.delete('/:eventID', deleteEvent)

module.exports = router
