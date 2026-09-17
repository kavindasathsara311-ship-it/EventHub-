const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');

const adapter = new FileSync(path.join(__dirname, 'db.json'));
const db = low(adapter);

// Set default values if file is empty
db.defaults({ users: [], events: [], bookings: [] }).write();

module.exports = db;
