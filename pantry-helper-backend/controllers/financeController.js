const pool = require('../db')

exports.getFinanceRecords = (req, res) => {
  const pantryID = req.params.pantryID

  const query = 'SELECT * FROM Finance WHERE pantryID = ?'

  pool.query(query, [pantryID], (error, results) => {
    if (error) {
      console.error('Error retrieving finance records:', error)
      return res
        .status(500)
        .json({ error: 'Failed to retrieve finance records' })
    }
    res.json(results)
  })
}

exports.addFinanceRecord = (req, res) => {
  const { pantryID } = req.params
  const { transactionType, amount, transactionDate, description } = req.body

  const query = `
    INSERT INTO Finance (pantryID, transactionType, amount, transactionDate, description)
    VALUES (?, ?, ?, ?, ?)
  `

  pool.query(
    query,
    [pantryID, transactionType, amount, transactionDate, description],
    (error, results) => {
      if (error) {
        console.error('Error adding finance record:', error)
        return res.status(500).json({ error: 'Failed to add finance record' })
      }
      res.status(201).json({ message: 'Finance record added successfully' })
    }
  )
}

exports.updateFinanceRecord = (req, res) => {
  const { id } = req.params
  const { transactionType, amount, transactionDate, description } = req.body

  const query = `
    UPDATE Finance
    SET transactionType = ?, amount = ?, transactionDate = ?, description = ?
    WHERE id = ?
  `

  pool.query(
    query,
    [transactionType, amount, transactionDate, description, id],
    (error, results) => {
      if (error) {
        console.error('Error updating finance record:', error)
        return res
          .status(500)
          .json({ error: 'Failed to update finance record' })
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ message: 'Finance record not found' })
      }

      res.status(200).json({ message: 'Finance record updated successfully' })
    }
  )
}

exports.deleteFinanceRecord = (req, res) => {
  const { id } = req.params

  const query = 'DELETE FROM Finance WHERE id = ?'

  pool.query(query, [id], (error, results) => {
    if (error) {
      console.error('Error deleting finance record:', error)
      return res.status(500).json({ error: 'Failed to delete finance record' })
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Finance record not found' })
    }

    res.status(200).json({ message: 'Finance record deleted successfully' })
  })
}
