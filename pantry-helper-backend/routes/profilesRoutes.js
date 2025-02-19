// routes/profilesRoutes.js
const express = require("express");
const router = express.Router();
const {
  addProfile,
  deleteProfile,
  getProfileById,
  updateProfile,
  getAllProfiles
} = require("../controllers/profilesController");

/**
 * @swagger
 * /api/profiles:
 *   get:
 *     summary: Get all profiles
 *     tags: [Profiles]
 *     responses:
 *       200:
 *         description: List of all profiles
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
 *                   currentPantry:
 *                     type: string
 *       500:
 *         description: Error retrieving profiles
 */
router.get('/', getAllProfiles);

/**
 * @swagger
 * /api/profiles/{id}:
 *   get:
 *     summary: Get profile by ID
 *     tags: [Profiles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Profile details with subscribed pantry list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 profileID:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 emailPreference:
 *                   type: boolean
 *                 currentPantry:
 *                   type: string
 *                 subscribedPantryList:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       pantryName:
 *                         type: string
 *                       userAuthority:
 *                         type: string
 *       404:
 *         description: Profile not found
 *       500:
 *         description: Error retrieving profile
 */
router.get("/:id", getProfileById);

/**
 * @swagger
 * /api/profiles:
 *   post:
 *     summary: Create or update a profile
 *     tags: [Profiles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - emailPreference
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               emailPreference:
 *                 type: boolean
 *               currentPantry:
 *                 type: string
 *                 default: "1"
 *     responses:
 *       201:
 *         description: Profile added successfully
 *       200:
 *         description: Profile updated successfully
 *       500:
 *         description: Error adding/updating profile
 */
router.post("/", addProfile);

/**
 * @swagger
 * /api/profiles/{id}:
 *   put:
 *     summary: Update a profile
 *     tags: [Profiles]
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
 *               - emailPreference
 *             properties:
 *               name:
 *                 type: string
 *               emailPreference:
 *                 type: boolean
 *               currentPantry:
 *                 type: string
 *               userAuthority:
 *                 type: string
 *               pantryID:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       404:
 *         description: Profile not found
 *       500:
 *         description: Error updating profile
 */
router.put("/:id", updateProfile);

/**
 * @swagger
 * /api/profiles/{id}:
 *   delete:
 *     summary: Delete a profile
 *     tags: [Profiles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Profile deleted successfully
 *       404:
 *         description: Profile not found
 *       500:
 *         description: Error deleting profile
 */
router.delete("/:id", deleteProfile);

module.exports = router;
