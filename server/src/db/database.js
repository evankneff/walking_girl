const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');

const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'walking_girl.db');
const db = new Database(dbPath);

function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS walking_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_name TEXT NOT NULL,
      minutes INTEGER NOT NULL,
      week_start_date TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_name) REFERENCES users(name)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  const adminPassword = process.env.ADMIN_PASSWORD || 'admin';

  const defaultSettings = {
    goal_minutes: '600',
    start_location: 'Start',
    end_location: 'Destination',
    admin_password: bcrypt.hashSync(adminPassword, 10),
  };

  const insertSetting = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
  Object.entries(defaultSettings).forEach(([key, value]) => {
    insertSetting.run(key, value);
  });

  // If ADMIN_PASSWORD env var is set, always sync it to the DB on startup
  if (process.env.ADMIN_PASSWORD) {
    const hashed = bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10);
    db.prepare('UPDATE settings SET value = ? WHERE key = ?').run(hashed, 'admin_password');
  }
}

initializeDatabase();

function getWeekStartDate(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
}

const queries = {
  // Users
  getAllUsers: db.prepare('SELECT * FROM users ORDER BY name'),
  getUserByName: db.prepare('SELECT * FROM users WHERE name = ?'),
  getUserById: db.prepare('SELECT * FROM users WHERE id = ?'),
  addUser: db.prepare('INSERT INTO users (name) VALUES (?)'),
  deleteUser: db.prepare('DELETE FROM users WHERE id = ?'),

  // Entries
  addEntry: db.prepare('INSERT INTO walking_entries (user_name, minutes, week_start_date, created_at) VALUES (?, ?, ?, ?)'),
  getAllEntries: db.prepare('SELECT * FROM walking_entries ORDER BY created_at DESC'),
  getEntriesByUser: db.prepare('SELECT * FROM walking_entries WHERE user_name = ? ORDER BY created_at DESC'),
  getTotalMinutes: db.prepare('SELECT COALESCE(SUM(minutes), 0) as total FROM walking_entries'),
  getWeekEntries: db.prepare('SELECT * FROM walking_entries WHERE week_start_date = ?'),
  deleteEntry: db.prepare('DELETE FROM walking_entries WHERE id = ?'),
  deleteEntriesByUser: db.prepare('DELETE FROM walking_entries WHERE user_name = ?'),

  // Settings
  getSetting: db.prepare('SELECT value FROM settings WHERE key = ?'),
  updateSetting: db.prepare('UPDATE settings SET value = ? WHERE key = ?'),
  getAllSettings: db.prepare('SELECT key, value FROM settings'),
};

// Transaction: delete a user and all their entries atomically
const deleteUserCascade = db.transaction((userId) => {
  const user = queries.getUserById.get(userId);
  if (!user) return { deleted: false, reason: 'User not found' };

  const entriesDeleted = queries.deleteEntriesByUser.run(user.name);
  queries.deleteUser.run(userId);

  return { deleted: true, userName: user.name, entriesRemoved: entriesDeleted.changes };
});

module.exports = {
  db,
  queries,
  getWeekStartDate,
  deleteUserCascade,
};
