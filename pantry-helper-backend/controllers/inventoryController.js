const pool = require("../db");

exports.getAllItems = (req, res) => {
  const { pantryID } = req.query;

  const query = `
    SELECT 
      i.id, 
      i.Name, 
      i.Quantity, 
      i.ExpDate, 
      COALESCE(outgoingData.totalOutgoing, 0) AS totalOutgoing, 
      (SELECT MIN(DateIn) 
       FROM Incoming inc 
       WHERE inc.Name = i.Name 
         AND inc.pantryID = i.pantryID 
         AND (SELECT SUM(Quantity) 
              FROM Incoming 
              WHERE Name = i.Name 
                AND pantryID = i.pantryID 
                AND DateIn <= inc.DateIn) 
           > COALESCE(outgoingData.totalOutgoing, 0)
      ) AS incomingDate,
      l.locationName
    FROM Inventory i
    LEFT JOIN (
      SELECT Name, pantryID, SUM(Quantity) AS totalOutgoing
      FROM Outgoing
      WHERE pantryID = ?
      GROUP BY Name, pantryID
    ) outgoingData ON i.Name = outgoingData.Name AND i.pantryID = outgoingData.pantryID
    LEFT JOIN Locations l ON i.id = l.inventoryID AND l.pantryID = i.pantryID
    WHERE i.pantryID = ?
    GROUP BY i.id, i.Name, i.Quantity, i.ExpDate, outgoingData.totalOutgoing, l.locationName
  `;

  pool.query(query, [pantryID, pantryID], (error, results) => {
    if (error) {
      console.error("Error fetching inventory data:", error);
      res.status(500).send("Error fetching inventory data");
    } else {
      res.json(results);
    }
  });
};

exports.clearInventory = (req, res) => {
  pool.query("DELETE FROM Inventory", (error) => {
    if (error) {
      res.status(500).send("Error clearing Inventory");
    } else {
      res.send("Inventory cleared");
    }
  });
};

exports.addItems = (req, res) => {
  const { name, quantity, expirationDate, pantryID, incomingDate } = req.body;

  // Check if the item with the same name and pantryID already exists
  pool.query(
    "SELECT id FROM Inventory WHERE Name = ? AND pantryID = ?",
    [name, pantryID],
    (error, ids) => {
      if (error) {
        return res.status(500).send("Error accessing Inventory");
      }

      // If the item does not exist, insert a new record
      if (ids.length === 0) {
        const query = expirationDate
          ? "INSERT INTO Inventory (Name, ExpDate, Quantity, pantryID) VALUES (?, ?, ?, ?)"
          : "INSERT INTO Inventory (Name, Quantity, pantryID) VALUES (?, ?, ?)";
        const values = expirationDate
          ? [name, expirationDate, quantity, pantryID]
          : [name, quantity, pantryID];

        pool.query(query, values, (error, result) => {
          if (error) {
            return res.status(500).send("Error adding item to Inventory");
          }

          // Insert into Incoming table to record incoming entry
          const incomingQuery =
            "INSERT INTO Incoming (Name, DateIn, Quantity, pantryID) VALUES (?, ?, ?, ?)";
          pool.query(
            incomingQuery,
            [name, incomingDate, quantity, pantryID],
            (error) => {
              if (error) {
                return res.status(500).send("Error adding item to Incoming");
              }

              res.status(200).send("Item added successfully with location");
            }
          );
        });
      } else {
        // If item exists for this pantry, update the existing entry instead
        req.params.id = ids[0].id;
        exports.updateItem(req, res);
      }
    }
  );
};

exports.updateItem = (req, res) => {
  const { id } = req.params;
  const { name, quantity, expirationDate, pantryID } = req.body;

  const query = expirationDate
    ? "UPDATE Inventory SET Name = ?, ExpDate = ?, Quantity = ? WHERE id = ? AND pantryID = ?"
    : "UPDATE Inventory SET Name = ?, Quantity = ? WHERE id = ? AND pantryID = ?";
  const values = expirationDate
    ? [name, expirationDate, quantity, id, pantryID]
    : [name, quantity, id, pantryID];

  pool.query(query, values, (error) => {
    if (error) return res.status(500).send("Error updating item");
    res.status(200).send("Item updated successfully");
  });
};

exports.deleteItem = async (req, res) => {
  const { id } = req.params;
  const { pantryID } = req.query;

  if (!id || !pantryID) {
    return res.status(400).send("Item ID and pantry ID are required.");
  }

  try {
    // Begin transaction to ensure all deletes happen atomically
    await pool.query("START TRANSACTION");

    // Delete from MapLayout where itemID matches
    await pool.query(
      "DELETE FROM MapLayout WHERE itemID = ? AND pantryID = ?",
      [id, pantryID]
    );

    // Delete from Locations where inventoryID matches
    await pool.query(
      "DELETE FROM Locations WHERE inventoryID = ? AND pantryID = ?",
      [id, pantryID]
    );

    // Delete the item from Inventory
    const result = await pool.query(
      "DELETE FROM Inventory WHERE id = ? AND pantryID = ?",
      [id, pantryID]
    );

    if (result.affectedRows === 0) {
      // If no item was deleted from Inventory, rollback and send a 404 error
      await pool.query("ROLLBACK");
      return res.status(404).send(`Item ${id} not found in pantry ${pantryID}`);
    }

    // Commit the transaction
    await pool.query("COMMIT");

    res
      .status(200)
      .send(
        `Item ${id} deleted along with associated MapLayout and Locations entries`
      );
  } catch (error) {
    console.error("Error deleting item:", error);

    // Rollback the transaction on error
    await pool.query("ROLLBACK");

    res.status(500).send("Error deleting item and associated data");
  }
};

exports.addIncomingEntry = (req, res) => {
  const { name, dateIn, quantity, pantryID } = req.body;

  const incomingQuery = `
    INSERT INTO Incoming (Name, DateIn, Quantity, pantryID)
    VALUES (?, ?, ?, ?)
  `;
  pool.query(incomingQuery, [name, dateIn, quantity, pantryID], (error) => {
    if (error) {
      return res.status(500).send("Error adding item to Incoming");
    }
    res.status(200).send("Incoming entry added successfully");
  });
};

exports.addOutgoingEntry = (req, res) => {
  const { name, dateOut, quantity, pantryID } = req.body;

  const query =
    "INSERT INTO Outgoing (Name, DateOut, Quantity, pantryID) VALUES (?, ?, ?, ?)";
  pool.query(query, [name, dateOut, quantity, pantryID], (error) => {
    if (error) return res.status(500).send("Error adding outgoing entry");
    res.status(200).send("Outgoing entry added successfully");
  });
};
