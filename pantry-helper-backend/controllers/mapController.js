const pool = require("../db");

exports.saveMapLayout = async (req, res) => {
  const { pantryID, layout } = req.body;

  if (!pantryID || !Array.isArray(layout)) {
    return res.status(400).send("Pantry ID and layout data are required.");
  }

  try {
    // Fetch the existing MapLayout for the pantry
    const [existingLayout] = await new Promise((resolve, reject) => {
      pool.query(
        "SELECT boxID, itemID FROM MapLayout WHERE pantryID = ?",
        [pantryID],
        (error, results) => {
          if (error) return reject(error);
          resolve([results]);
        }
      );
    });

    // Ensure existingLayout is an array
    const existingBoxIDs = Array.isArray(existingLayout)
      ? existingLayout.map((box) => box.boxID)
      : [];

    // Get the list of new boxIDs
    const newBoxIDs = layout.map((box) => box.boxID);

    // Identify deleted boxes
    const deletedBoxIDs = existingBoxIDs.filter(
      (id) => !newBoxIDs.includes(id)
    );

    // Delete corresponding entries in Locations for deleted boxes
    if (deletedBoxIDs.length > 0) {
      await Promise.all(
        deletedBoxIDs.map((boxID) => {
          const deletedBox = existingLayout.find((box) => box.boxID === boxID);
          if (deletedBox?.itemID) {
            return new Promise((resolve, reject) => {
              pool.query(
                "DELETE FROM Locations WHERE pantryID = ? AND inventoryID = ?",
                [pantryID, deletedBox.itemID],
                (error) => {
                  if (error) return reject(error);
                  resolve();
                }
              );
            });
          }
        })
      );
    }

    // Overwrite existing layout in MapLayout
    await new Promise((resolve, reject) => {
      pool.query(
        "DELETE FROM MapLayout WHERE pantryID = ?",
        [pantryID],
        (error) => {
          if (error) return reject(error);
          resolve();
        }
      );
    });

    // Insert new layout and update Locations table
    const insertPromises = layout.map((box) => {
      const { boxID, x, y, w, h, name, itemID } = box;

      return new Promise((resolve, reject) => {
        pool.query(
          "INSERT INTO MapLayout (pantryID, boxID, x, y, w, h, name, itemID) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          [pantryID, boxID, x, y, w, h, name, itemID || null],
          (error) => {
            if (error) return reject(error);

            // Update Locations table if itemID is present
            if (itemID) {
              pool.query(
                `INSERT INTO Locations (pantryID, locationName, inventoryID) 
                 VALUES (?, ?, ?)
                 ON DUPLICATE KEY UPDATE 
                 locationName = VALUES(locationName), 
                 inventoryID = VALUES(inventoryID)`,
                [pantryID, name, itemID],
                (error) => {
                  if (error) return reject(error);
                  resolve();
                }
              );
            } else {
              resolve();
            }
          }
        );
      });
    });

    await Promise.all(insertPromises);

    res.status(200).send("Layout saved successfully.");
  } catch (error) {
    console.error("Error saving map layout:", error.message || error);
    res.status(500).send("Failed to save layout.");
  }
};

// Fetch the map layout for a pantry
exports.getMapLayout = async (req, res) => {
  const { pantryID } = req.params;
  const query = "SELECT * FROM MapLayout WHERE PantryID = ?";

  pool.query(query, [pantryID], (error, results) => {
    if (error) {
      console.error("Error fetching events by pantry ID:", error);
      return res.status(500).json({ error: "Error fetching events" });
    }
    res.json(results);
  });
};
