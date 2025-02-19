const pool = require('../db')

exports.addRequest = (req, res) => {
  const { profileID, pantryID, itemName, quantity, requestDate, completed } =
    req.body

  if (
    !profileID ||
    !pantryID ||
    !itemName ||
    !quantity ||
    !requestDate ||
    completed === undefined
  ) {
    return res.status(400).json({ error: 'Missing required fields.' })
  }

  // First check if user already has an active request for this item
  const checkExistingQuery = `
    SELECT * FROM Requests 
    WHERE profileID = ? 
    AND pantryID = ? 
    AND itemName = ? 
    AND completed = FALSE
  `;

  pool.query(checkExistingQuery, [profileID, pantryID, itemName], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error.' })
    }

    if (results.length > 0) {
      return res.status(400).json({ error: 'You have already requested this item.' })
    }

    // If no existing request, proceed with insertion
    const insertRequestQuery = `
      INSERT INTO Requests (profileID, pantryID, itemName, requestDate, quantity, completed)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    pool.query(
      insertRequestQuery,
      [profileID, pantryID, itemName, requestDate, quantity, completed],
      (err, results) => {
        if (err) {
          if (err.code === 'ER_NO_REFERENCED_ROW_2') {
            return res
              .status(400)
              .json({ error: 'Invalid profileID or pantryID.' })
          }
          return res.status(500).json({ error: 'Internal server error.' })
        }
        res.status(201).json({ message: 'Request added successfully.' })
      }
    )
  })
}

exports.getRequestsByPantryID = (req, res) => {
  const { pantryID } = req.params

  const query = `
    SELECT profileID, pantryID, itemName, requestDate, quantity, completed
    FROM Requests
    WHERE pantryID = ?
    ORDER BY requestDate DESC
  `

  pool.query(query, [pantryID], (error, results) => {
    if (error) {
      return res.status(500).json({ error: 'Internal server error.' })
    }

    res.status(200).json(results)
  })
}

exports.deleteRequest = (req, res) => {
  const { profileID, pantryID, itemName } = req.params

  const query = `
    DELETE FROM Requests WHERE profileID = ? AND pantryID = ? AND itemName = ?
  `

  pool.query(query, [profileID, pantryID, itemName], (error, results) => {
    if (error) {
      return res.status(500).json({ error: 'Internal server error.' })
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Request not found.' })
    }

    res.status(200).json({ message: 'Request deleted successfully.' })
  })
}

exports.markRequestCompleted = (req, res) => {
  const { profileID, pantryID, itemName } = req.body

  if (!profileID || !pantryID || !itemName) {
    return res.status(400).json({ error: 'Missing required fields.' })
  }

  const updateQuery = `
    UPDATE Requests
    SET completed = TRUE
    WHERE profileID = ? AND pantryID = ? AND itemName = ?
  `

  pool.query(updateQuery, [profileID, pantryID, itemName], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error.' })
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Request not found.' })
    }

    res.status(200).json({ message: 'Request marked as completed.' })
  })
}

exports.markRequestIncomplete = (req, res) => {
  const { profileID, pantryID, itemName } = req.body

  if (!profileID || !pantryID || !itemName) {
    return res.status(400).json({ error: 'Missing required fields.' })
  }

  const updateQuery = `
    UPDATE Requests
    SET completed = FALSE
    WHERE profileID = ? AND pantryID = ? AND itemName = ?
  `

  pool.query(updateQuery, [profileID, pantryID, itemName], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error.' })
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Request not found.' })
    }

    res.status(200).json({ message: 'Request marked as completed.' })
  })
}

exports.updateRequest = (req, res) => {
  const { profileID, pantryID, itemName } = req.params
  const { newItemName, newQuantity } = req.body

  if (!newItemName && !newQuantity) {
    return res
      .status(400)
      .json({ error: 'Must provide either new item name or quantity.' })
  }

  let updateQuery = 'UPDATE Requests SET '
  const updateValues = []

  if (newItemName) {
    updateQuery += 'itemName = ?'
    updateValues.push(newItemName)
  }

  if (newQuantity) {
    if (newItemName) updateQuery += ', '
    updateQuery += 'quantity = ?'
    updateValues.push(newQuantity)
  }

  updateQuery += ' WHERE profileID = ? AND pantryID = ? AND itemName = ?'
  updateValues.push(profileID, pantryID, itemName)

  pool.query(updateQuery, updateValues, (err, results) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res
          .status(400)
          .json({ error: 'An item with this name already exists.' })
      }
      return res.status(500).json({ error: 'Internal server error.' })
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Request not found.' })
    }

    res.status(200).json({ message: 'Request updated successfully.' })
  })
}
