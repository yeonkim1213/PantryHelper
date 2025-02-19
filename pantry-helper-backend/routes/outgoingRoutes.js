const express = require('express')
const router = express.Router()
const { getAllOutgoingItems } = require('../controllers/outgoingController')

router.get('/', getAllOutgoingItems)

module.exports = router
