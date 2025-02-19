const express = require('express')
const router = express.Router()
const {
  addRequest,
  getRequestsByPantryID,
  deleteRequest,
  markRequestCompleted,
  markRequestIncomplete,
  updateRequest
} = require('../controllers/requestController')

/**
 * @swagger
 * /api/requests:
 *   post:
 *     summary: Create a new request
 *     tags: [Requests]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - profileID
 *               - pantryID
 *               - itemName
 *               - quantity
 *               - requestDate
 *               - completed
 *             properties:
 *               profileID:
 *                 type: string
 *               pantryID:
 *                 type: string
 *               itemName:
 *                 type: string
 *               quantity:
 *                 type: number
 *               requestDate:
 *                 type: string
 *                 format: date-time
 *               completed:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Request added successfully
 *       400:
 *         description: Missing required fields or duplicate request
 *       500:
 *         description: Internal server error
 */
router.post('/', addRequest)

/**
 * @swagger
 * /api/requests/pantry/{pantryID}:
 *   get:
 *     summary: Get requests by pantry ID
 *     tags: [Requests]
 *     parameters:
 *       - in: path
 *         name: pantryID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of requests for the specified pantry
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   profileID:
 *                     type: string
 *                   pantryID:
 *                     type: string
 *                   itemName:
 *                     type: string
 *                   requestDate:
 *                     type: string
 *                     format: date-time
 *                   quantity:
 *                     type: number
 *                   completed:
 *                     type: boolean
 *       500:
 *         description: Internal server error
 */
router.get('/pantry/:pantryID', getRequestsByPantryID)

/**
 * @swagger
 * /api/requests/{profileID}/{pantryID}/{itemName}:
 *   delete:
 *     summary: Delete a request
 *     tags: [Requests]
 *     parameters:
 *       - in: path
 *         name: profileID
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: pantryID
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: itemName
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Request deleted successfully
 *       404:
 *         description: Request not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:profileID/:pantryID/:itemName', deleteRequest)

/**
 * @swagger
 * /api/requests/complete:
 *   put:
 *     summary: Mark a request as completed
 *     tags: [Requests]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - profileID
 *               - pantryID
 *               - itemName
 *             properties:
 *               profileID:
 *                 type: string
 *               pantryID:
 *                 type: string
 *               itemName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Request marked as completed
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: Request not found
 *       500:
 *         description: Internal server error
 */
router.put('/complete', markRequestCompleted)

/**
 * @swagger
 * /api/requests/incomplete:
 *   put:
 *     summary: Mark a request as incomplete
 *     tags: [Requests]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - profileID
 *               - pantryID
 *               - itemName
 *             properties:
 *               profileID:
 *                 type: string
 *               pantryID:
 *                 type: string
 *               itemName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Request marked as incomplete
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: Request not found
 *       500:
 *         description: Internal server error
 */
router.put('/incomplete', markRequestIncomplete)

/**
 * @swagger
 * /api/requests/update/{profileID}/{pantryID}/{itemName}:
 *   put:
 *     summary: Update a request
 *     tags: [Requests]
 *     parameters:
 *       - in: path
 *         name: profileID
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: pantryID
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: itemName
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newItemName:
 *                 type: string
 *               newQuantity:
 *                 type: number
 *     responses:
 *       200:
 *         description: Request updated successfully
 *       400:
 *         description: Must provide either new item name or quantity
 *       404:
 *         description: Request not found
 *       500:
 *         description: Internal server error
 */
router.put('/update/:profileID/:pantryID/:itemName', updateRequest)

module.exports = router
