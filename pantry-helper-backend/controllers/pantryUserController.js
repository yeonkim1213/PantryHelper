const pool = require('../db')

exports.getPantryUsers = (req, res) => {
  const query = `SELECT profileID, pantryID, userAuthority FROM PantryUsers`
  pool.query(query, (error, results) => {
    if (error)
      return res.status(500).json({ error: 'Error retrieving pantry users' })
    res.json(results)
  })
}

exports.addPantryUser = (req, res) => {
  const { profileID, pantryID, userAuthority } = req.body
  const query = `INSERT INTO PantryUsers (profileID, pantryID, userAuthority) VALUES (?, ?, ?)`
  pool.query(query, [profileID, pantryID, userAuthority], (error, results) => {
    if (error)
      return res.status(500).json({ error: 'Error adding pantry user' })
    res.status(201).json({ message: 'Pantry user added successfully' })
  })
}

exports.deletePantryUser = (req, res) => {
  const { profileID, pantryID } = req.params
  const query = `DELETE FROM PantryUsers WHERE profileID = ? AND pantryID = ?`
  pool.query(query, [profileID, pantryID], (error, results) => {
    if (error)
      return res.status(500).json({ error: 'Error deleting pantry user' })
    if (results.affectedRows === 0)
      return res.status(404).json({ message: 'Pantry user not found' })
    res.status(200).json({ message: 'Pantry user deleted successfully' })
  })
}

exports.getUserSubscriptions = (req, res) => {
  const profileID = req.params.profileID
  const query =
    'SELECT pantryID, userAuthority FROM PantryUsers WHERE profileID = ?'
  pool.query(query, [profileID], (error, results) => {
    if (error)
      return res.status(500).json({ error: 'Error getting user subscriptions' })
    res.json(results)
  })
}

exports.getPantryUsersWithProfiles = (req, res) => {
  const { pantryID } = req.params
  const query = `
    SELECT PantryUsers.profileID, Profiles.name, Profiles.email, Profiles.emailPreference, PantryUsers.userAuthority
    FROM PantryUsers
    INNER JOIN Profiles ON PantryUsers.profileID = Profiles.profileID
    WHERE PantryUsers.pantryID = ?
  `
  pool.query(query, [pantryID], (error, results) => {
    if (error)
      return res
        .status(500)
        .json({ error: 'Error retrieving pantry users with profiles' })
    res.json(results)
  })
}

exports.updateUserAuthority = (req, res) => {
  const { profileID, pantryID } = req.params
  const { userAuthority } = req.body
  const query = `UPDATE PantryUsers SET userAuthority = ? WHERE profileID = ? AND pantryID = ?`

  pool.query(query, [userAuthority, profileID, pantryID], (error, results) => {
    if (error)
      return res.status(500).json({ error: 'Error updating user authority' })
    if (results.affectedRows === 0)
      return res.status(404).json({ message: 'Pantry user not found' })
    res.status(200).json({ message: 'User authority updated successfully' })
  })
}
