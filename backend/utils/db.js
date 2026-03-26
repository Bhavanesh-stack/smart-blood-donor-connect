const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');

const adapter = new FileSync(path.join(__dirname, '..', 'db', 'db.json'));
const db = low(adapter);

// Set defaults
db.defaults({ users: [], donors: [], requests: [] }).write();

function readDB() {
  db.read();
  return db;
}

function writeDB() {
  db.write();
}

module.exports = { db, readDB, writeDB };
