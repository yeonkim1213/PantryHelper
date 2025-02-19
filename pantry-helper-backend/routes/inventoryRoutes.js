const express = require("express");
const router = express.Router();
const {
  getAllItems,
  addItems,
  updateItem,
  deleteItem,
  addOutgoingEntry,
  addIncomingEntry,
} = require("../controllers/inventoryController");

/**
 * @swagger
 * /api/inventory:
 *   get:
 *     summary: Get all inventory items for a pantry
 *     tags: [Inventory]
 *     parameters:
 *       - in: query
 *         name: pantryID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of inventory items with outgoing totals and location info
 *       500:
 *         description: Error fetching inventory data
 */
router.get("/", getAllItems);

/**
 * @swagger
 * /api/inventory:
 *   post:
 *     summary: Add new item to inventory
 *     tags: [Inventory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - quantity
 *               - pantryID
 *             properties:
 *               name:
 *                 type: string
 *               quantity:
 *                 type: number
 *               expirationDate:
 *                 type: string
 *                 format: date
 *               pantryID:
 *                 type: string
 *     responses:
 *       200:
 *         description: Item added or updated successfully
 *       500:
 *         description: Error adding/updating item
 */
router.post("/", addItems);


/**
 * @swagger
 * /api/inventory/incoming:
 *   post:
 *     summary: Add an incoming entry
 *     tags: [Inventory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - dateIn
 *               - quantity
 *               - pantryID
 *             properties:
 *               name:
 *                 type: string
 *               dateIn:
 *                 type: string
 *                 format: date
 *               quantity:
 *                 type: number
 *               pantryID:
 *                 type: string
 *     responses:
 *       200:
 *         description: Incoming entry added successfully
 *       500:
 *         description: Error adding incoming entry
 */
router.post("/Incoming", addIncomingEntry);

/**
 * @swagger
 * /api/inventory/outgoing:
 *   post:
 *     summary: Add an outgoing entry
 *     tags: [Inventory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - dateOut
 *               - quantity
 *               - pantryID
 *             properties:
 *               name:
 *                 type: string
 *               dateOut:
 *                 type: string
 *                 format: date
 *               quantity:
 *                 type: number
 *               pantryID:
 *                 type: string
 *     responses:
 *       200:
 *         description: Outgoing entry added successfully
 *       500:
 *         description: Error adding outgoing entry
 */
router.post("/Outgoing", addOutgoingEntry);

/**
 * @swagger
 * /api/inventory/{id}:
 *   put:
 *     summary: Update an inventory item
 *     tags: [Inventory]
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
 *               - quantity
 *               - pantryID
 *             properties:
 *               name:
 *                 type: string
 *               quantity:
 *                 type: number
 *               expirationDate:
 *                 type: string
 *                 format: date
 *               pantryID:
 *                 type: string
 *     responses:
 *       200:
 *         description: Item updated successfully
 *       500:
 *         description: Error updating item
 */
router.put("/:id", updateItem);

/**
 * @swagger
 * /api/inventory/{id}:
 *   delete:
 *     summary: Delete an inventory item and associated data
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: pantryID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item and associated data deleted successfully
 *       400:
 *         description: Item ID and pantry ID are required
 *       404:
 *         description: Item not found
 *       500:
 *         description: Error deleting item
 */
router.delete("/:id", deleteItem);


module.exports = router;
