const express = require('express');
const router = express.Router();
const { queries, getWeekStartDate } = require('../db/database');

// Get progress data for dashboard
router.get('/progress', (req, res) => {
  try {
    // Get all settings
    const settings = {};
    const settingsRows = queries.getAllSettings.all();
    settingsRows.forEach(row => {
      settings[row.key] = row.value;
    });

    // Get total minutes walked
    const totalResult = queries.getTotalMinutes.get();
    const totalMinutes = totalResult ? totalResult.total : 0;

    // Get goal minutes
    const goalMinutes = parseInt(settings.goal_minutes || '600');

    // Calculate progress percentage
    const progressPercentage = goalMinutes > 0 
      ? Math.min((totalMinutes / goalMinutes) * 100, 100) 
      : 0;

    // Get current week's entries
    const currentWeekStart = getWeekStartDate();
    const weekEntries = queries.getWeekEntries.all(currentWeekStart);
    const weekMinutes = weekEntries.reduce((sum, entry) => sum + entry.minutes, 0);

    // Get all entries for detailed stats
    const allEntries = queries.getAllEntries.all();

    res.json({
      totalMinutes,
      goalMinutes,
      progressPercentage: Math.round(progressPercentage * 100) / 100,
      startLocation: settings.start_location || 'Start',
      endLocation: settings.end_location || 'Destination',
      weekMinutes,
      weekStartDate: currentWeekStart,
      totalEntries: allEntries.length
    });
  } catch (error) {
    console.error('Error getting progress:', error);
    res.status(500).json({ error: 'Failed to get progress data' });
  }
});

module.exports = router;

