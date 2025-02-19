const express = require("express");
const router = express.Router();
const { saveMapLayout, getMapLayout } = require("../controllers/mapController");

/**
 * @swagger
 * /api/map/pantry/{pantryID}:
 *   get:
 *     summary: Get map layout for a pantry
 *     tags: [Map]
 *     parameters:
 *       - in: path
 *         name: pantryID
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the pantry to fetch map layout for
 *     responses:
 *       200:
 *         description: Map layout data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   boxID:
 *                     type: string
 *                   x:
 *                     type: number
 *                   y:
 *                     type: number
 *                   w:
 *                     type: number
 *                   h:
 *                     type: number
 *                   name:
 *                     type: string
 *                   itemID:
 *                     type: string
 *       500:
 *         description: Error fetching map layout
 */
router.get("/pantry/:pantryID", getMapLayout);

/**
 * @swagger
 * /api/map:
 *   post:
 *     summary: Save map layout for a pantry
 *     tags: [Map]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pantryID
 *               - layout
 *             properties:
 *               pantryID:
 *                 type: string
 *               layout:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - boxID
 *                     - x
 *                     - y
 *                     - w
 *                     - h
 *                     - name
 *                   properties:
 *                     boxID:
 *                       type: string
 *                     x:
 *                       type: number
 *                     y:
 *                       type: number
 *                     w:
 *                       type: number
 *                     h:
 *                       type: number
 *                     name:
 *                       type: string
 *                     itemID:
 *                       type: string
 *     responses:
 *       200:
 *         description: Layout saved successfully
 *       400:
 *         description: Pantry ID and layout data are required
 *       500:
 *         description: Failed to save layout
 */
router.post("/", saveMapLayout);

module.exports = router;
