import { app } from 'electron';
import { join } from 'node:path';
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

sqlite3.verbose();

const TAG = '[sqlite3]';
let database: Database;

export async function getSqlite3(filename = join(app.getPath('userData'), 'calendar.sqlite')) {
    database ??= await open({
        driver: sqlite3.Database,
        filename,
    });
    
    await database.run('PRAGMA journal_mode = WAL;');
    
    await database.migrate();
    
    return database;
}
