const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { queries, getWeekStartDate } = require('../db/database');
const { authenticateToken, generateToken } = require('../middleware/auth');

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    // Get admin password from settings
    const setting = queries.getSetting.get('admin_password');
    if (!setting) {
      return res.status(500).json({ error: 'Admin password not configured' });
    }

    const hashedPassword = setting.value;

    // Compare passwords
    const match = await bcrypt.compare(password, hashedPassword);
    if (!match) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Generate token
    const token = generateToken({ admin: true });

    res.json({ token, success: true });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get all settings (protected)
router.get('/settings', authenticateToken, (req, res) => {
  try {
    const settingsRows = queries.getAllSettings.all();
    const settings = {};
    settingsRows.forEach(row => {
      // Don't send password hash
      if (row.key !== 'admin_password') {
        settings[row.key] = row.value;
      }
    });

    res.json(settings);
  } catch (error) {
    console.error('Error getting settings:', error);
    res.status(500).json({ error: 'Failed to get settings' });
  }
});

// Update settings (protected)
router.post('/settings', authenticateToken, (req, res) => {
  try {
    const { goal_minutes, start_location, end_location, admin_password } = req.body;

    if (goal_minutes !== undefined) {
      const minutes = parseInt(goal_minutes);
      if (isNaN(minutes) || minutes <= 0) {
        return res.status(400).json({ error: 'Goal minutes must be a positive number' });
      }
      queries.updateSetting.run(minutes.toString(), 'goal_minutes');
    }

    if (start_location !== undefined) {
      queries.updateSetting.run(start_location, 'start_location');
    }

    if (end_location !== undefined) {
      queries.updateSetting.run(end_location, 'end_location');
    }

    if (admin_password !== undefined && admin_password.trim()) {
      // Hash new password
      const hashedPassword = bcrypt.hashSync(admin_password, 10);
      queries.updateSetting.run(hashedPassword, 'admin_password');
    }

    res.json({ success: true, message: 'Settings updated' });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Get all users (protected)
router.get('/users', authenticateToken, (req, res) => {
  try {
    const users = queries.getAllUsers.all();
    res.json(users);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Add user (protected)
router.post('/users', authenticateToken, (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    queries.addUser.run(name.trim());
    const user = queries.getUserByName.get(name.trim());

    res.json({ success: true, user });
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ error: 'User already exists' });
    }
    console.error('Error adding user:', error);
    res.status(500).json({ error: 'Failed to add user' });
  }
});

// Delete user (protected)
router.delete('/users/:id', authenticateToken, (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    queries.deleteUser.run(id);
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Get all entries (protected)
router.get('/entries', authenticateToken, (req, res) => {
  try {
    const entries = queries.getAllEntries.all();
    res.json(entries);
  } catch (error) {
    console.error('Error getting entries:', error);
    res.status(500).json({ error: 'Failed to get entries' });
  }
});

// Delete entry (protected)
router.delete('/entries/:id', authenticateToken, (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid entry ID' });
    }

    queries.deleteEntry.run(id);
    res.json({ success: true, message: 'Entry deleted' });
  } catch (error) {
    console.error('Error deleting entry:', error);
    res.status(500).json({ error: 'Failed to delete entry' });
  }
});

module.exports = router;

