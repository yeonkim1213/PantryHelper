const express = require('express')
const router = express.Router()
const {
  getFinanceRecords,
  addFinanceRecord,
  updateFinanceRecord,
  deleteFinanceRecord
} = require('../controllers/financeController')

/**
 * @swagger
 * /api/finance/{pantryID}:
 *   get:
 *     summary: Get finance records for a pantry
 *     tags: [Finance]
 *     parameters:
 *       - in: path
 *         name: pantryID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of finance records
 *       500:
 *         description: Failed to retrieve finance records
 */
router.get('/:pantryID', getFinanceRecords)

/**
 * @swagger
 * /api/finance/{pantryID}:
 *   post:
 *     summary: Add a finance record
 *     tags: [Finance]
 *     parameters:
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
 *               - transactionType
 *               - amount
 *               - transactionDate
 *             properties:
 *               transactionType:
 *                 type: string
 *               amount:
 *                 type: number
 *               transactionDate:
 *                 type: string
 *                 format: date
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Finance record added successfully
 *       500:
 *         description: Failed to add finance record
 */
router.post('/:pantryID', addFinanceRecord)

/**
 * @swagger
 * /api/finance/{id}:
 *   put:
 *     summary: Update a finance record
 *     tags: [Finance]
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
 *               - transactionType
 *               - amount
 *               - transactionDate
 *             properties:
 *               transactionType:
 *                 type: string
 *               amount:
 *                 type: number
 *               transactionDate:
 *                 type: string
 *                 format: date
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Finance record updated successfully
 *       404:
 *         description: Finance record not found
 *       500:
 *         description: Failed to update finance record
 */
router.put('/:id', updateFinanceRecord)

/**
 * @swagger
 * /api/finance/{id}:
 *   delete:
 *     summary: Delete a finance record
 *     tags: [Finance]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Finance record deleted successfully
 *       404:
 *         description: Finance record not found
 *       500:
 *         description: Failed to delete finance record
 */
router.delete('/:id', deleteFinanceRecord)

module.exports = router
