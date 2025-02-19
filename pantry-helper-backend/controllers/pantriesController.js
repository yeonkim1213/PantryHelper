const pool = require('../db')

exports.getAllPantries = (req, res) => {
  pool.query('SELECT * FROM Pantries', (error, results) => {
    if (error) {
      console.error('Error getting all pantries:', error)
      return res.status(500).json({ error: 'Error getting all pantries' })
    }
    res.json(results)
  })
}

exports.getPantryByID = (req, res) => {
  const pantryID = req.params.id
  const query = 'SELECT * FROM Pantries WHERE pantryID = ?'
  pool.query(query, [pantryID], (error, results) => {
    if (error) {
      console.error('Error getting pantry by id:', error)
      return res.status(500).json({ error: 'Error getting pantry' })
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Pantry not found' })
    }
    res.json(results[0])
  })
}

exports.addPantry = (req, res) => {
  const { name, accessCode } = req.body
  const finalAccessCode = accessCode || '00000000'
  const query = `
    INSERT INTO Pantries (name, accessCode)
    VALUES (?, ?)
  `
  pool.query(query, [name, finalAccessCode], (error, results) => {
    if (error) {
      console.error('Error adding pantry:', error)
      return res.status(500).json({ error: 'Error adding pantry' })
    }
    res
      .status(201)
      .json({
        message: 'Pantry added successfully',
        pantryID: results.insertId
      })
  })
}

exports.updatePantry = (req, res) => {
  const pantryID = req.params.id
  const { name, accessCode } = req.body

  const query = `
    UPDATE Pantries
    SET name = ?, accessCode = ?
    WHERE pantryID = ?
  `

  pool.query(query, [name, accessCode, pantryID], (error, results) => {
    if (error) {
      console.error('Error updating pantry:', error)
      return res.status(500).json({ error: 'Error updating pantry' })
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Pantry not found' })
    }
    res.status(200).json({ message: 'Pantry updated successfully' })
  })
}

exports.deletePantryByID = (req, res) => {
  const pantryID = req.params.id
  const query = 'DELETE FROM Pantries WHERE pantryID = ?'

  pool.query(query, [pantryID], (error, results) => {
    if (error) {
      console.error('Error deleting pantry:', error)
      return res.status(500).json({ error: 'Error deleting pantry' })
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Pantry not found' })
    }
    res.status(200).json({ message: 'Pantry deleted successfully' })
  })
}

exports.verifyAccessCode = (req, res) => {
  const { accessCode, pantryID } = req.body;
  const query = 'SELECT pantryID FROM Pantries WHERE accessCode = ? AND pantryID = ?';
  
  pool.query(query, [accessCode, pantryID], (error, results) => {
    if (error) {
      console.error('Error verifying access code:', error);
      return res.status(500).json({ error: 'Error verifying access code' });
    }
    if (results.length === 0) {
      return res.status(400).json({ error: 'Invalid access code for the selected pantry' });
    }
    res.json({ pantryID: results[0].pantryID });
  });
};

exports.getPantriesInfo = (req, res) => {
  const pID = req.params.pantryID;

  const query = 'SELECT * FROM PantryInfo';

  pool.query(query, (error, results) => {
    if (error) {
      console.error('Error getting pantry email:', error);
      return res.status(500).json({ error: 'Error getting pantry email' });
    }
    if (results.length === 0) {
      return res.status(400).json({ error: 'No Email Field' });
    }
    res.json(results);
  });
};

exports.getPantryEmail = (req, res) => {
  const pID = req.params.pantryID;

  const query = 'SELECT Email FROM PantryInfo where pantryID = ?';
  
  pool.query(query, [pID], (error, results) => {
    if (error) {
      console.error('Error getting pantry email:', error);
      return res.status(500).json({ error: 'Error getting pantry email' });
    }
    if (results.length === 0) {
      return res.status(400).json({ error: 'No Email Field' });
    }
    res.json(results);
  });
};


exports.getPantryName = (req, res) => {
  const pID = req.params.pantryID;

  const query = 'SELECT Name FROM PantryInfo WHERE pantryID = ?';
  pool.query(query, [pID], (error, results) => {
    if (error) {
      console.error('Error getting pantry name:', error);
      return res.status(500).json({ error: 'Error getting pantry name' });
    }
    if (results.length === 0) {
      return res.status(400).json({ error: 'No name Field' });
    }
    res.json(results);
  });
};

exports.getPantryLocation = (req, res) => {
  const pID = req.params.pantryID;

  const query = 'SELECT Location FROM PantryInfo WHERE pantryID = ?';
  pool.query(query, [pID], (error, results) => {
    if (error) {
      console.error('Error getting pantry location:', error);
      return res.status(500).json({ error: 'Error getting pantry location' });
    }
    if (results.length === 0) {
      return res.status(400).json({ error: 'No location Field' });
    }
    res.json(results);
  });
};

exports.getPantryPhone = (req, res) => {
  const pID = req.params.pantryID;

  const query = 'SELECT Phone FROM PantryInfo WHERE pantryID = ?';
  pool.query(query, [pID], (error, results) => {
    if (error) {
      console.error('Error getting pantry phone:', error);
      return res.status(500).json({ error: 'Error getting pantry phone' });
    }
    if (results.length === 0) {
      return res.status(400).json({ error: 'No phone Field' });
    }
    res.json(results);
  });
};
