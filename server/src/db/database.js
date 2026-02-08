const { Firestore } = require('@google-cloud/firestore');
const bcrypt = require('bcrypt');

// Initialize Firestore using Application Default Credentials.
// - Cloud Run: ADC is automatic (service account)
// - Local dev: ADC via `gcloud auth application-default login`
const firestoreConfig = {};
if (process.env.GOOGLE_CLOUD_PROJECT) {
  firestoreConfig.projectId = process.env.GOOGLE_CLOUD_PROJECT;
}
const db = new Firestore(firestoreConfig);

const usersCol = db.collection('users');
const entriesCol = db.collection('entries');
const settingsCol = db.collection('settings');
const configDocRef = settingsCol.doc('config');

/**
 * Seed the settings/config doc if it doesn't exist,
 * and sync ADMIN_PASSWORD env var on every startup.
 */
async function initializeDatabase() {
  const configSnap = await configDocRef.get();
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin';

  if (!configSnap.exists) {
    await configDocRef.set({
      goal_minutes: '600',
      start_location: 'Start',
      end_location: 'Destination',
      admin_password: bcrypt.hashSync(adminPassword, 10),
    });
  }

  // If ADMIN_PASSWORD env var is set, always sync it to the DB on startup
  if (process.env.ADMIN_PASSWORD) {
    const hashed = bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10);
    await configDocRef.update({ admin_password: hashed });
  }
}

/**
 * Week-start helper — unchanged from SQLite version.
 */
function getWeekStartDate(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
}

// ---------------------------------------------------------------------------
// Queries object — mirrors the old SQLite `queries` interface.
// Each sub-object exposes .all() / .get() / .run() that return Promises.
// ---------------------------------------------------------------------------

const queries = {
  // ---- Users ----
  getAllUsers: {
    all: async () => {
      const snap = await usersCol.orderBy('name').get();
      return snap.docs.map((doc) => ({ id: doc.id, name: doc.data().name }));
    },
  },

  getUserByName: {
    get: async (name) => {
      const snap = await usersCol.where('name', '==', name).limit(1).get();
      if (snap.empty) return undefined;
      const doc = snap.docs[0];
      return { id: doc.id, name: doc.data().name };
    },
  },

  getUserById: {
    get: async (id) => {
      const doc = await usersCol.doc(id).get();
      if (!doc.exists) return undefined;
      return { id: doc.id, name: doc.data().name };
    },
  },

  addUser: {
    run: async (name) => {
      // Enforce uniqueness (Firestore has no built-in unique constraint)
      const existing = await usersCol.where('name', '==', name).limit(1).get();
      if (!existing.empty) {
        const err = new Error('User already exists');
        err.code = 'DUPLICATE_USER';
        throw err;
      }
      await usersCol.add({ name });
    },
  },

  deleteUser: {
    run: async (id) => {
      await usersCol.doc(id).delete();
    },
  },

  // ---- Entries ----
  addEntry: {
    run: async (userName, minutes, weekStartDate, createdAt) => {
      await entriesCol.add({
        user_name: userName,
        minutes,
        week_start_date: weekStartDate,
        created_at: createdAt,
      });
    },
  },

  getAllEntries: {
    all: async () => {
      const snap = await entriesCol.orderBy('created_at', 'desc').get();
      return snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    },
  },

  getEntriesByUser: {
    all: async (userName) => {
      const snap = await entriesCol
        .where('user_name', '==', userName)
        .orderBy('created_at', 'desc')
        .get();
      return snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    },
  },

  getTotalMinutes: {
    get: async () => {
      const snap = await entriesCol.select('minutes').get();
      const total = snap.docs.reduce(
        (sum, doc) => sum + (doc.data().minutes || 0),
        0,
      );
      return { total };
    },
  },

  getWeekEntries: {
    all: async (weekStartDate) => {
      const snap = await entriesCol
        .where('week_start_date', '==', weekStartDate)
        .get();
      return snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    },
  },

  deleteEntry: {
    run: async (id) => {
      await entriesCol.doc(id).delete();
    },
  },

  deleteEntriesByUser: {
    run: async (userName) => {
      const snap = await entriesCol
        .where('user_name', '==', userName)
        .get();
      const batch = db.batch();
      snap.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
      return { changes: snap.size };
    },
  },

  // ---- Settings ----
  getSetting: {
    get: async (key) => {
      const doc = await configDocRef.get();
      if (!doc.exists) return undefined;
      const val = doc.data()[key];
      if (val === undefined) return undefined;
      return { value: val };
    },
  },

  updateSetting: {
    run: async (value, key) => {
      await configDocRef.update({ [key]: value });
    },
  },

  getAllSettings: {
    all: async () => {
      const doc = await configDocRef.get();
      if (!doc.exists) return [];
      const data = doc.data();
      return Object.entries(data).map(([key, value]) => ({ key, value }));
    },
  },
};

/**
 * Delete a user and all their entries atomically via a Firestore batch.
 * Mirrors the old SQLite transaction-based deleteUserCascade.
 */
async function deleteUserCascade(userId) {
  const userDoc = await usersCol.doc(userId).get();
  if (!userDoc.exists) return { deleted: false, reason: 'User not found' };

  const userName = userDoc.data().name;
  const entriesSnap = await entriesCol
    .where('user_name', '==', userName)
    .get();

  const batch = db.batch();
  entriesSnap.docs.forEach((doc) => batch.delete(doc.ref));
  batch.delete(userDoc.ref);
  await batch.commit();

  return { deleted: true, userName, entriesRemoved: entriesSnap.size };
}

module.exports = {
  db,
  queries,
  getWeekStartDate,
  deleteUserCascade,
  initializeDatabase,
};
