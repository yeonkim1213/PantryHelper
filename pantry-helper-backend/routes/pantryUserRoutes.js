const express = require('express')
const router = express.Router()
const {
  addPantryUser,
  getPantryUsers,
  deletePantryUser,
  getUserSubscriptions,
  getPantryUsersWithProfiles,
  updateUserAuthority
} = require('../controllers/pantryUserController')

/**
 * @swagger
 * /api/pantry-users:
 *   get:
 *     summary: Get all pantry users
 *     tags: [PantryUsers]
 *     responses:
 *       200:
 *         description: List of all pantry users
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
 *                   userAuthority:
 *                     type: string
 *       500:
 *         description: Error retrieving pantry users
 */
router.get('/', getPantryUsers)

/**
 * @swagger
 * /api/pantry-users/{pantryID}/profiles:
 *   get:
 *     summary: Get all users with profiles for a specific pantry
 *     tags: [PantryUsers]
 *     parameters:
 *       - in: path
 *         name: pantryID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of pantry users with their profiles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   profileID:
 *                     type: string
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                   emailPreference:
 *                     type: boolean
 *                   userAuthority:
 *                     type: string
 *       500:
 *         description: Error retrieving pantry users with profiles
 */
router.get('/:pantryID/profiles', getPantryUsersWithProfiles)

/**
 * @swagger
 * /api/pantry-users:
 *   post:
 *     summary: Add a new pantry user
 *     tags: [PantryUsers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - profileID
 *               - pantryID
 *               - userAuthority
 *             properties:
 *               profileID:
 *                 type: string
 *               pantryID:
 *                 type: string
 *               userAuthority:
 *                 type: string
 *     responses:
 *       201:
 *         description: Pantry user added successfully
 *       500:
 *         description: Error adding pantry user
 */
router.post('/', addPantryUser)

/**
 * @swagger
 * /api/pantry-users/{profileID}/{pantryID}:
 *   delete:
 *     summary: Delete a pantry user
 *     tags: [PantryUsers]
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
 *     responses:
 *       200:
 *         description: Pantry user deleted successfully
 *       404:
 *         description: Pantry user not found
 *       500:
 *         description: Error deleting pantry user
 */
router.delete('/:profileID/:pantryID', deletePantryUser)

/**
 * @swagger
 * /api/pantry-users/{profileID}/subscriptions:
 *   get:
 *     summary: Get user's pantry subscriptions
 *     tags: [PantryUsers]
 *     parameters:
 *       - in: path
 *         name: profileID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of user's pantry subscriptions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   pantryID:
 *                     type: string
 *                   userAuthority:
 *                     type: string
 *       500:
 *         description: Error getting user subscriptions
 */
router.get('/:profileID/subscriptions', getUserSubscriptions)

/**
 * @swagger
 * /api/pantry-users/{profileID}/{pantryID}/authority:
 *   put:
 *     summary: Update user's authority in a pantry
 *     tags: [PantryUsers]
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userAuthority
 *             properties:
 *               userAuthority:
 *                 type: string
 *     responses:
 *       200:
 *         description: User authority updated successfully
 *       404:
 *         description: Pantry user not found
 *       500:
 *         description: Error updating user authority
 */
router.put('/:profileID/:pantryID/authority', updateUserAuthority)

module.exports = router
