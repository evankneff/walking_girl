const express = require('express');
const router = express.Router();
const { queries, getWeekStartDate } = require('../db/database');

const MAX_MINUTES_PER_ENTRY = 300;
const MAX_NAME_LENGTH = 100;

// Public endpoint: list approved names for the entry form dropdown
router.get('/users/names', async (req, res) => {
  try {
    const users = await queries.getAllUsers.all();
    res.json(users.map(u => u.name));
  } catch (error) {
    console.error('Error fetching user names:', error);
    res.status(500).json({ error: 'Failed to fetch names' });
  }
});

// Submit walking time entry
router.post('/entries', async (req, res) => {
  try {
    const { name, minutes } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const userName = name.trim();

    if (userName.length > MAX_NAME_LENGTH) {
      return res.status(400).json({ error: `Name must be ${MAX_NAME_LENGTH} characters or fewer` });
    }

    if (!minutes || isNaN(minutes) || minutes <= 0) {
      return res.status(400).json({ error: 'Valid minutes (greater than 0) is required' });
    }

    const minutesInt = parseInt(minutes);

    if (minutesInt > MAX_MINUTES_PER_ENTRY) {
      return res.status(400).json({ error: `Maximum ${MAX_MINUTES_PER_ENTRY} minutes per entry` });
    }

    // Whitelist only — name must already exist in users
    const user = await queries.getUserByName.get(userName);
    if (!user) {
      return res.status(400).json({ error: 'Name not found. Please select a name from the list.' });
    }

    const weekStartDate = getWeekStartDate();
    const createdAt = new Date().toISOString();
    await queries.addEntry.run(userName, minutesInt, weekStartDate, createdAt);

    // Calculate relative stats
    const userEntries = await queries.getEntriesByUser.all(userName);
    const userTotal = userEntries.reduce((sum, e) => sum + (e.minutes || 0), 0);
    
    const goalSetting = await queries.getSetting.get('goal_minutes');
    const goalMinutes = parseInt(goalSetting ? goalSetting.value : '600');
    
    const contributionPercent = goalMinutes > 0 ? (userTotal / goalMinutes) * 100 : 0;

    res.json({
      success: true,
      message: `Successfully added ${minutesInt} minutes for ${userName}`,
      relativeStats: {
        userTotalMinutes: userTotal,
        contributionPercent: Math.round(contributionPercent * 10) / 10
      }
    });
  } catch (error) {
    console.error('Error adding entry:', error);
    res.status(500).json({ error: 'Failed to add entry' });
  }
});

module.exports = router;
