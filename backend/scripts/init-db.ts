import sqlite3 from 'sqlite3';
import { DB_SCHEMA } from '../shared/types.ts';

const DB_PATH = process.env.TWINSIGHT_DB || './data/events.db';

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Failed to open database:', err);
    process.exit(1);
  }
  console.log('Connected to SQLite database');
});

db.exec(DB_SCHEMA, (err) => {
  if (err) {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  }
  console.log('Database schema initialized successfully');
  db.close();
});