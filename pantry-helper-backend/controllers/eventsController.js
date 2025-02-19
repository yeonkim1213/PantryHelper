const pool = require('../db')

exports.getEventsByPantryID = (req, res) => {
  const pantryID = req.params.pantryID
  const query = 'SELECT * FROM Events WHERE PantryID = ?'

  pool.query(query, [pantryID], (error, results) => {
    if (error) {
      console.error('Error fetching events by pantry ID:', error)
      return res.status(500).json({ error: 'Error fetching events' })
    }
    res.json(results)
  })
}

exports.addEvent = (req, res) => {
  const {
    pantryID,
    EventTitle,
    EventDetail,
    IconPath,
    EventDate,
    EventLocation
  } = req.body

  const query = `
    INSERT INTO Events (PantryID, EventTitle, EventDetail, IconPath, EventDate, EventLocation)
    VALUES (?, ?, ?, ?, ?, ?)
  `

  pool.query(
    query,
    [pantryID, EventTitle, EventDetail, IconPath, EventDate, EventLocation],
    (error, results) => {
      if (error) {
        console.error('Error adding event:', error)
        return res.status(500).send('Error adding event')
      }

      const newEvent = {
        eventID: results.insertId,
        PantryID: pantryID,
        EventTitle,
        EventDetail,
        IconPath,
        EventDate,
        EventLocation
      }

      res
        .status(201)
        .json({ message: 'Event added successfully', event: newEvent })
    }
  )
}

exports.updateEvent = (req, res) => {
  const { eventID } = req.params
  const { EventTitle, EventDetail, IconPath, EventDate, EventLocation } =
    req.body

  if (!EventTitle || !IconPath) {
    return res.status(400).send('Missing required fields')
  }

  const query = `
    UPDATE Events 
    SET EventTitle = ?, EventDetail = ?, IconPath = ?, EventDate = ?, EventLocation = ? 
    WHERE eventID = ?
  `

  pool.query(
    query,
    [EventTitle, EventDetail, IconPath, EventDate, EventLocation, eventID],
    (error, results) => {
      if (error) {
        console.error('Error updating event:', error)
        return res.status(500).send('Error updating event')
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ message: 'Event not found' })
      }

      res.status(200).send('Event updated successfully')
    }
  )
}

exports.deleteEvent = (req, res) => {
  const eventID = req.params.eventID

  const query = `DELETE FROM Events WHERE eventID = ?`

  pool.query(query, [eventID], (error, results) => {
    if (error) {
      console.error('Error deleting event:', error)
      return res.status(500).send('Error deleting event')
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Event not found' })
    }

    res.status(200).json({ message: 'Event deleted successfully' })
  })
}
