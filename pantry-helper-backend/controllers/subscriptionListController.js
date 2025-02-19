const pool = require('../db')

exports.getUserSubscriptions = (req, res) => {
  const profileID = req.params.profileID

  const query = 'SELECT pantryID FROM PantryUsers WHERE profileID = ?'

  pool.query(query, [profileID], (error, results) => {
    if (error) {
      console.error('Error getting user subscriptions:', error)
      return res.status(500).json({ error: 'Error getting user subscriptions' })
    }

    const subscribedPantryList = results.map(row => row.pantryID)
    res.json({ subscribedPantryList })
  })
}

exports.getEmailsByPantryId = (req, res) => {
  const pantryID = req.params.pantryID

  const query = `
    SELECT P.email
    FROM Profiles P
    JOIN PantryUsers PU ON P.profileID = PU.profileID
    WHERE PU.pantryID = ?
  `

  pool.query(query, [pantryID], (error, results) => {
    if (error) {
      console.error('Error retrieving emails:', error)
      return res.status(500).json({ error: 'Error retrieving emails' })
    }

    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: 'No emails found for the given pantry ID' })
    }

    res.json(results)
  })
}

exports.getProfileIDbyPantry = (req, res) => {
  const pantryID = req.params.pantryID

  const query = `
    SELECT P.profileID
    FROM Profiles P
    JOIN PantryUsers PU ON P.profileID = PU.profileID
    WHERE PU.pantryID = ?
  `

  pool.query(query, [pantryID], (error, results) => {
    if (error) {
      console.error('Error retrieving emails:', error)
      return res.status(500).json({ error: 'Error retrieving emails' })
    }

    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: 'No emails found for the given pantry ID' })
    }

    res.json(results)
  })
}
