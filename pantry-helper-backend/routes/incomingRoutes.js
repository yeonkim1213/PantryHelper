const express = require('express')
const router = express.Router()
const { getAllIncomingItems } = require('../controllers/incomingController')

router.get('/', getAllIncomingItems)

module.exports = router
