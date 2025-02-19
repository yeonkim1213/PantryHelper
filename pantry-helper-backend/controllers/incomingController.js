const pool = require('../db')

exports.getAllIncomingItems = (req, res) => {
  const { pantryID } = req.query

  const query = `SELECT * FROM Incoming WHERE pantryID = ?`

  pool.query(query, [pantryID], (error, results) => {
    if (error) {
      console.error('Error fetching incoming items:', error)
      res.status(500).send('Error fetching incoming items')
    } else {
      res.json(results)
    }
  })
}
