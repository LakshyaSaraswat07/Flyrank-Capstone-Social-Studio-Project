import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';
import { config } from '../config.js';
import { SCHEMA_SQL } from './schema.js';

let dbInstance: DatabaseSync | null = null;

export function getDatabase(dbPath?: string): DatabaseSync {
  if (dbInstance) {
    return dbInstance;
  }

  const targetPath = dbPath || config.databasePath;
  if (targetPath !== ':memory:') {
    const dir = path.dirname(targetPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  dbInstance = new DatabaseSync(targetPath);
  if (targetPath !== ':memory:') {
    dbInstance.exec('PRAGMA journal_mode = WAL;');
  }
  dbInstance.exec('PRAGMA foreign_keys = ON;');
  dbInstance.exec(SCHEMA_SQL);

  return dbInstance;
}

export function resetTestDatabase(): DatabaseSync {
  if (dbInstance) {
    try {
      dbInstance.close();
    } catch {
      // ignore
    }
  }
  dbInstance = new DatabaseSync(':memory:');
  dbInstance.exec('PRAGMA foreign_keys = ON;');
  dbInstance.exec(SCHEMA_SQL);
  return dbInstance;
}

export function closeDatabase(): void {
  if (dbInstance) {
    try {
      dbInstance.close();
    } catch {
      // ignore
    }
    dbInstance = null;
  }
}
