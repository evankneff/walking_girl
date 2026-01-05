const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'walking_girl.db');
const db = new Database(dbPath);

// Initialize database schema
function initializeDatabase() {
  // Create users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    )
  `);

  // Create walking_entries table
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

  // Create settings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  // Initialize default settings if they don't exist
  const defaultSettings = {
    goal_minutes: '600',
    start_location: 'Start',
    end_location: 'Destination',
    admin_password: bcrypt.hashSync('admin', 10) // Default password: 'admin'
  };

  const insertSetting = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
  Object.entries(defaultSettings).forEach(([key, value]) => {
    insertSetting.run(key, value);
  });
}

// Initialize database on module load
initializeDatabase();

// Helper function to get week start date (Monday)
function getWeekStartDate(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
}

// Database queries
const queries = {
  // Users
  getAllUsers: db.prepare('SELECT * FROM users ORDER BY name'),
  getUserByName: db.prepare('SELECT * FROM users WHERE name = ?'),
  addUser: db.prepare('INSERT INTO users (name) VALUES (?)'),
  deleteUser: db.prepare('DELETE FROM users WHERE id = ?'),

  // Entries
  addEntry: db.prepare('INSERT INTO walking_entries (user_name, minutes, week_start_date, created_at) VALUES (?, ?, ?, ?)'),
  getAllEntries: db.prepare('SELECT * FROM walking_entries ORDER BY created_at DESC'),
  getTotalMinutes: db.prepare('SELECT COALESCE(SUM(minutes), 0) as total FROM walking_entries'),
  getWeekEntries: db.prepare('SELECT * FROM walking_entries WHERE week_start_date = ?'),
  deleteEntry: db.prepare('DELETE FROM walking_entries WHERE id = ?'),

  // Settings
  getSetting: db.prepare('SELECT value FROM settings WHERE key = ?'),
  updateSetting: db.prepare('UPDATE settings SET value = ? WHERE key = ?'),
  getAllSettings: db.prepare('SELECT key, value FROM settings')
};

module.exports = {
  db,
  queries,
  getWeekStartDate
};

