const express = require('express');
const router = express.Router();
const { queries, getWeekStartDate } = require('../db/database');

// Get progress data for dashboard
router.get('/progress', async (req, res) => {
  try {
    // Get all settings
    const settings = {};
    const settingsRows = await queries.getAllSettings.all();
    settingsRows.forEach(row => {
      settings[row.key] = row.value;
    });

    // Get total minutes walked
    const totalResult = await queries.getTotalMinutes.get();
    const totalMinutes = totalResult ? totalResult.total : 0;

    // Get goal minutes
    const goalMinutes = parseInt(settings.goal_minutes || '600');

    // Calculate progress percentage
    const progressPercentage = goalMinutes > 0 
      ? Math.min((totalMinutes / goalMinutes) * 100, 100) 
      : 0;

    // Get current week's entries
    const currentWeekStart = getWeekStartDate();
    const weekEntries = await queries.getWeekEntries.all(currentWeekStart);
    const weekMinutes = weekEntries.reduce((sum, entry) => sum + entry.minutes, 0);

    // Get all entries for detailed stats
    const allEntries = await queries.getAllEntries.all();

    // Calculate streak
    const entriesByWeek = {};
    allEntries.forEach(e => {
      if (!entriesByWeek[e.week_start_date]) {
        entriesByWeek[e.week_start_date] = 0;
      }
      entriesByWeek[e.week_start_date] += e.minutes;
    });

    const sortedWeeks = Object.keys(entriesByWeek).sort((a, b) => new Date(b) - new Date(a));
    
    let streakWeeks = 0;
    const currentWeek = getWeekStartDate();
    
    if (sortedWeeks.length > 0) {
        const currentWeekDate = new Date(currentWeek);
        const mostRecentEntryWeekDate = new Date(sortedWeeks[0]);
        const diffToCurrent = (currentWeekDate - mostRecentEntryWeekDate) / (1000 * 60 * 60 * 24);
        
        if (diffToCurrent <= 7) {
             streakWeeks = 1;
             let lastWeekDate = new Date(sortedWeeks[0]);
             
             for (let i = 1; i < sortedWeeks.length; i++) {
                const thisWeekDate = new Date(sortedWeeks[i]);
                const diffTime = Math.abs(lastWeekDate - thisWeekDate);
                const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)); 
                
                if (diffDays === 7) {
                    streakWeeks++;
                    lastWeekDate = thisWeekDate;
                } else {
                    break;
                }
            }
        }
    }

    res.json({
      totalMinutes,
      goalMinutes,
      progressPercentage: Math.round(progressPercentage * 100) / 100,
      startLocation: settings.start_location || 'Start',
      endLocation: settings.end_location || 'Destination',
      weekMinutes,
      weekStartDate: currentWeekStart,
      totalEntries: allEntries.length,
      streakWeeks
    });
  } catch (error) {
    console.error('Error getting progress:', error);
    res.status(500).json({ error: 'Failed to get progress data' });
  }
});

// Get historical progress
router.get('/progress/history', async (req, res) => {
  try {
    const allEntries = await queries.getAllEntries.all();
    const entriesByWeek = {};
    
    allEntries.forEach(e => {
      if (!entriesByWeek[e.week_start_date]) {
        entriesByWeek[e.week_start_date] = 0;
      }
      entriesByWeek[e.week_start_date] += e.minutes;
    });

    const history = Object.entries(entriesByWeek)
      .map(([weekStartDate, totalMinutes]) => ({ weekStartDate, totalMinutes }))
      .sort((a, b) => new Date(a.weekStartDate) - new Date(b.weekStartDate));

    res.json(history);
  } catch (error) {
    console.error('Error getting history:', error);
    res.status(500).json({ error: 'Failed to get history' });
  }
});

module.exports = router;
