// routes/pantriesRoutes.js
const express = require('express')
const router = express.Router()
const {
  getAllPantries,
  getPantryByID,
  addPantry,
  updatePantry,
  deletePantryByID,
  verifyAccessCode,
  getPantryEmail,
  getPantryLocation,
  getPantryPhone,
  getPantryName,
  getPantriesInfo
} = require('../controllers/pantriesController')

/**
 * @swagger
 * /api/pantries:
 *   get:
 *     summary: Get all pantries
 *     tags: [Pantries]
 *     responses:
 *       200:
 *         description: List of all pantries
 *       500:
 *         description: Error getting all pantries
 */
router.get('/', getAllPantries)

/**
 * @swagger
 * /api/pantries/{id}:
 *   get:
 *     summary: Get pantry by ID
 *     tags: [Pantries]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pantry details
 *       404:
 *         description: Pantry not found
 *       500:
 *         description: Error getting pantry
 */
router.get('/:id', getPantryByID)

/**
 * @swagger
 * /api/pantries/{pantryID}/email:
 *   get:
 *     summary: Get pantry email
 *     tags: [Pantries]
 *     parameters:
 *       - in: path
 *         name: pantryID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pantry email retrieved successfully
 *       400:
 *         description: No Email Field
 *       500:
 *         description: Error getting pantry email
 */
router.get("/:pantryID/email", getPantryEmail);

/**
 * @swagger
 * /api/pantries/{pantryID}/location:
 *   get:
 *     summary: Get pantry location
 *     tags: [Pantries]
 *     parameters:
 *       - in: path
 *         name: pantryID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pantry location retrieved successfully
 *       400:
 *         description: No location Field
 *       500:
 *         description: Error getting pantry location
 */
router.get("/:pantryID/location", getPantryLocation);

/**
 * @swagger
 * /api/pantries/{pantryID}/phone:
 *   get:
 *     summary: Get pantry phone
 *     tags: [Pantries]
 *     parameters:
 *       - in: path
 *         name: pantryID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pantry phone retrieved successfully
 *       400:
 *         description: No phone Field
 *       500:
 *         description: Error getting pantry phone
 */
router.get("/:pantryID/phone", getPantryPhone);

/**
 * @swagger
 * /api/pantries/{pantryID}/name:
 *   get:
 *     summary: Get pantry name
 *     tags: [Pantries]
 *     parameters:
 *       - in: path
 *         name: pantryID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pantry name retrieved successfully
 *       400:
 *         description: No name Field
 *       500:
 *         description: Error getting pantry name
 */
router.get("/:pantryID/name", getPantryName);

router.get("/all", getPantriesInfo);

/**
 * @swagger
 * /api/pantries:
 *   post:
 *     summary: Create a new pantry
 *     tags: [Pantries]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               accessCode:
 *                 type: string
 *                 default: "00000000"
 *     responses:
 *       201:
 *         description: Pantry created successfully
 *       500:
 *         description: Error adding pantry
 */
router.post('/', addPantry)

/**
 * @swagger
 * /api/pantries/verify-access-code:
 *   post:
 *     summary: Verify pantry access code
 *     tags: [Pantries]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accessCode
 *             properties:
 *               accessCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Access code verified successfully
 *       400:
 *         description: Invalid access code
 *       500:
 *         description: Error verifying access code
 */
router.post('/verify-access-code', verifyAccessCode)

/**
 * @swagger
 * /api/pantries/{id}:
 *   put:
 *     summary: Update a pantry
 *     tags: [Pantries]
 *     parameters:
 *       - in: path
 *         name: id
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
 *               - name
 *               - accessCode
 *             properties:
 *               name:
 *                 type: string
 *               accessCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Pantry updated successfully
 *       404:
 *         description: Pantry not found
 *       500:
 *         description: Error updating pantry
 */
router.put('/:id', updatePantry)

/**
 * @swagger
 * /api/pantries/{id}:
 *   delete:
 *     summary: Delete a pantry
 *     tags: [Pantries]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pantry deleted successfully
 *       404:
 *         description: Pantry not found
 *       500:
 *         description: Error deleting pantry
 */
router.delete('/:id', deletePantryByID)

module.exports = router
