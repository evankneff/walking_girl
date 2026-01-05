const express = require('express');
const router = express.Router();
const { queries, getWeekStartDate } = require('../db/database');

// Submit walking time entry
router.post('/entries', (req, res) => {
  try {
    const { name, minutes } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    if (!minutes || isNaN(minutes) || minutes <= 0) {
      return res.status(400).json({ error: 'Valid minutes (greater than 0) is required' });
    }

    const userName = name.trim();
    const minutesInt = parseInt(minutes);

    // Check if user exists, if not create them
    let user = queries.getUserByName.get(userName);
    if (!user) {
      try {
        queries.addUser.run(userName);
        user = queries.getUserByName.get(userName);
      } catch (err) {
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
          // Race condition - user was created between check and insert
          user = queries.getUserByName.get(userName);
        } else {
          throw err;
        }
      }
    }

    // Get current week start date
    const weekStartDate = getWeekStartDate();

    // Insert entry
    const createdAt = new Date().toISOString();
    queries.addEntry.run(userName, minutesInt, weekStartDate, createdAt);

    res.json({ 
      success: true, 
      message: `Successfully added ${minutesInt} minutes for ${userName}` 
    });
  } catch (error) {
    console.error('Error adding entry:', error);
    res.status(500).json({ error: 'Failed to add entry' });
  }
});

module.exports = router;

