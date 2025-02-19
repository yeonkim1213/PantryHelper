const pool = require('../db')

exports.getAllOutgoingItems = (req, res) => {
  const { pantryID } = req.query
  const query = `SELECT * FROM Outgoing WHERE pantryID = ?`

  pool.query(query, [pantryID], (error, results) => {
    if (error) {
      console.error('Error fetching outgoing items:', error)
      res.status(500).send('Error fetching outgoing items')
    } else {
      res.json(results)
    }
  })
}
