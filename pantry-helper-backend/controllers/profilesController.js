const pool = require("../db");

exports.addProfile = (req, res) => {
  const { name, email, emailPreference, currentPantry = 1 } = req.body;

  // First check if profile exists
  const checkQuery = "SELECT profileID FROM Profiles WHERE email = ?";

  pool.query(checkQuery, [email], (error, results) => {
    if (error) {
      console.error("Error checking profile:", error);
      return res.status(500).json({ error: "Error checking profile" });
    }

    if (results.length > 0) {
      // Profile exists - update
      const updateQuery = `
        UPDATE Profiles 
        SET name = ?, emailPreference = ?, currentPantry = ?
        WHERE email = ?
      `;

      pool.query(
        updateQuery,
        [name, emailPreference, currentPantry, email],
        (error) => {
          if (error) {
            console.error("Error updating profile:", error);
            return res.status(500).json({ error: "Error updating profile" });
          }

          res.status(200).json({
            message: "Profile updated successfully",
            profileID: results[0].profileID,
          });
        }
      );
    } else {
      // Profile doesn't exist - insert
      const insertQuery = `
        INSERT INTO Profiles (name, email, emailPreference, currentPantry)
        VALUES (?, ?, ?, ?)
      `;

      pool.query(
        insertQuery,
        [name, email, emailPreference, currentPantry],
        (error, results) => {
          if (error) {
            console.error("Error creating profile:", error);
            return res.status(500).json({ error: "Error creating profile" });
          }

          res.status(201).json({
            message: "Profile created successfully",
            profileID: results.insertId,
          });
        }
      );
    }
  });
};

exports.deleteProfile = (req, res) => {
  const profileID = req.params.id;

  const deleteSubscriptionsQuery =
    "DELETE FROM SubscriptionList WHERE profileID = ?";
  pool.query(deleteSubscriptionsQuery, [profileID], (error) => {
    if (error) {
      console.error("Error deleting subscriptions:", error);
      return res.status(500).json({ error: "Error deleting subscriptions" });
    }

    const deleteProfileQuery = "DELETE FROM Profiles WHERE profileID = ?";
    pool.query(deleteProfileQuery, [profileID], (error, results) => {
      if (error) {
        console.error("Error deleting profile:", error);
        return res.status(500).json({ error: "Error deleting profile" });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ message: "Profile not found" });
      }

      res.status(200).json({ message: "Profile deleted successfully" });
    });
  });
};

exports.getProfileById = (req, res) => {
  const profileID = req.params.id;

  const query = `
    SELECT 
      p.profileID, 
      p.name, 
      p.email, 
      p.emailPreference,
      p.currentPantry,
      JSON_ARRAYAGG(
        JSON_OBJECT(
          'pantryName', Pantries.name,
          'userAuthority', PantryUsers.userAuthority
        )
      ) AS subscribedPantryList
    FROM Profiles p
    LEFT JOIN SubscriptionList s ON p.profileID = s.profileID
    LEFT JOIN Pantries ON s.pantryID = Pantries.pantryID
    LEFT JOIN PantryUsers ON p.profileID = PantryUsers.profileID AND Pantries.pantryID = PantryUsers.pantryID
    WHERE p.profileID = ?
    GROUP BY p.profileID
  `;

  pool.query(query, [profileID], (error, results) => {
    if (error) {
      console.error("Error retrieving profile:", error);
      return res.status(500).json({ error: "Error retrieving profile" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const profile = results[0];

    if (profile.subscribedPantryList) {
      try {
        profile.subscribedPantryList = JSON.parse(
          profile.subscribedPantryList
        ).filter((pantry) => pantry.pantryName !== null);
      } catch (parseError) {
        console.error("Error parsing subscribedPantryList:", parseError);
        profile.subscribedPantryList = [];
      }
    } else {
      profile.subscribedPantryList = [];
    }

    res.json(profile);
  });
};

exports.getAllProfiles = (req, res) => {
  const query = "SELECT * FROM Profiles";

  pool.query(query, (error, results) => {
    if (error) {
      console.error("Error retrieving profiles:", error);
      return res.status(500).json({ error: "Error retrieving profiles" });
    }

    res.json(results);
  });
};

exports.updateProfile = (req, res) => {
  const profileID = req.params.id;
  const { name, emailPreference, userAuthority, pantryID, currentPantry } =
    req.body;

  const query =
    "UPDATE Profiles SET name = ?, emailPreference = ?, currentPantry = ? WHERE profileID = ?";

  pool.query(
    query,
    [name, emailPreference, currentPantry, profileID],
    (error, results) => {
      if (error) {
        console.error("Error updating profile:", error);
        return res.status(500).json({ error: "Error updating profile" });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ message: "Profile not found" });
      }

      if (userAuthority && pantryID) {
        const pantryUserQuery = `
        INSERT INTO PantryUsers (profileID, pantryID, userAuthority)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE userAuthority = VALUES(userAuthority)
      `;
        pool.query(
          pantryUserQuery,
          [profileID, pantryID, userAuthority],
          (err) => {
            if (err) {
              console.error("Error updating pantry user:", err);
              return res
                .status(500)
                .json({ error: "Error updating pantry user" });
            }
          }
        );
      }

      res.json({ message: "Profile updated successfully" });
    }
  );
};
