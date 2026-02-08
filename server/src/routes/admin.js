const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { queries, deleteUserCascade } = require('../db/database');
const { authenticateToken, generateToken } = require('../middleware/auth');

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const setting = await queries.getSetting.get('admin_password');
    if (!setting) {
      return res.status(500).json({ error: 'Admin password not configured' });
    }

    const match = await bcrypt.compare(password, setting.value);
    if (!match) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const token = generateToken({ admin: true });
    res.json({ token, success: true });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get all settings (protected)
router.get('/settings', authenticateToken, async (req, res) => {
  try {
    const settingsRows = await queries.getAllSettings.all();
    const settings = {};
    settingsRows.forEach(row => {
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
router.post('/settings', authenticateToken, async (req, res) => {
  try {
    const { goal_minutes, start_location, end_location, admin_password } = req.body;

    if (goal_minutes !== undefined) {
      const minutes = parseInt(goal_minutes);
      if (isNaN(minutes) || minutes <= 0) {
        return res.status(400).json({ error: 'Goal minutes must be a positive number' });
      }
      await queries.updateSetting.run(minutes.toString(), 'goal_minutes');
    }

    if (start_location !== undefined) {
      await queries.updateSetting.run(start_location, 'start_location');
    }

    if (end_location !== undefined) {
      await queries.updateSetting.run(end_location, 'end_location');
    }

    if (admin_password !== undefined && admin_password.trim()) {
      const hashedPassword = bcrypt.hashSync(admin_password, 10);
      await queries.updateSetting.run(hashedPassword, 'admin_password');
    }

    res.json({ success: true, message: 'Settings updated' });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Get all users (protected)
router.get('/users', authenticateToken, async (req, res) => {
  try {
    const users = await queries.getAllUsers.all();
    res.json(users);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Add user (protected)
router.post('/users', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    if (name.trim().length > 100) {
      return res.status(400).json({ error: 'Name must be 100 characters or fewer' });
    }

    await queries.addUser.run(name.trim());
    const user = await queries.getUserByName.get(name.trim());

    res.json({ success: true, user });
  } catch (error) {
    if (error.code === 'DUPLICATE_USER') {
      return res.status(400).json({ error: 'User already exists' });
    }
    console.error('Error adding user:', error);
    res.status(500).json({ error: 'Failed to add user' });
  }
});

// Delete user — cascades to entries (protected)
router.delete('/users/:id', authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const result = await deleteUserCascade(id);

    if (!result.deleted) {
      return res.status(404).json({ error: result.reason });
    }

    res.json({
      success: true,
      message: `Deleted ${result.userName} and ${result.entriesRemoved} entries`,
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Get all entries (protected) — supports ?user_name= filter
router.get('/entries', authenticateToken, async (req, res) => {
  try {
    const { user_name } = req.query;

    let entries;
    if (user_name) {
      entries = await queries.getEntriesByUser.all(user_name);
    } else {
      entries = await queries.getAllEntries.all();
    }

    res.json(entries);
  } catch (error) {
    console.error('Error getting entries:', error);
    res.status(500).json({ error: 'Failed to get entries' });
  }
});

// Delete entry (protected)
router.delete('/entries/:id', authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: 'Invalid entry ID' });
    }

    await queries.deleteEntry.run(id);
    res.json({ success: true, message: 'Entry deleted' });
  } catch (error) {
    console.error('Error deleting entry:', error);
    res.status(500).json({ error: 'Failed to delete entry' });
  }
});

module.exports = router;
