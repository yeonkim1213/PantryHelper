const express = require('express')
const router = express.Router()
const {
  getUserSubscriptions,
  getEmailsByPantryId,
  getProfileIDbyPantry
} = require('../controllers/subscriptionListController')

/**
 * @swagger
 * /api/subscriptions/profile/{profileID}/subscriptions:
 *   get:
 *     summary: Get user subscriptions
 *     tags: [Subscriptions]
 *     parameters:
 *       - in: path
 *         name: profileID
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the profile to get subscriptions for
 *     responses:
 *       200:
 *         description: List of user subscriptions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 subscribedPantryList:
 *                   type: array
 *                   items:
 *                     type: string
 *       500:
 *         description: Error getting user subscriptions
 */
router.get('/profile/:profileID/subscriptions', getUserSubscriptions)

/**
 * @swagger
 * /api/subscriptions/profile/{pantryID}/emails:
 *   get:
 *     summary: Get all user emails for a pantry
 *     tags: [Subscriptions]
 *     parameters:
 *       - in: path
 *         name: pantryID
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the pantry to get emails for
 *     responses:
 *       200:
 *         description: List of user emails for the pantry
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   email:
 *                     type: string
 *       404:
 *         description: No emails found for the given pantry ID
 *       500:
 *         description: Error retrieving emails
 */
router.get('/profile/:pantryID/emails', getEmailsByPantryId)

/**
 * @swagger
 * /api/subscriptions/profile/{pantryID}/emails:
 *   get:
 *     summary: Get all user emails for a pantry
 *     tags: [Subscriptions]
 *     parameters:
 *       - in: path
 *         name: pantryID
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the pantry to get emails for
 *     responses:
 *       200:
 *         description: List of user emails for the pantry
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   profileID:
 *                     type: string
 *       404:
 *         description: No emails found for the given pantry ID
 *       500:
 *         description: Error retrieving emails
 */
router.get('/profile/:pantryID/profileID', getProfileIDbyPantry)



module.exports = router
