import { ipcMain } from 'electron';
import { Database } from 'sqlite';
import { initEvents } from './data/events.js';
import { getSqlite3 } from './sqlite3.js';

let db: Database = null;

export function toPlaceholders(obj: object) {
    return Object.entries(obj).reduce(
        (acc: Record<string, unknown>, [ key, val ]) => {
            if (!key.startsWith('$')) {
                key = '$' + key;
            }
            
            acc[key] = val;
            
            return acc;
        },
        {}
    );
}

export default async function initDatabase() {
    try {
        db = await getSqlite3();
    }
    catch (err) {
        throw err;
    }
    
    function useEvents() {
        const eventsManager = initEvents(db);
        
        ipcMain.handle('calendar:get-all-events', async (e, { from, to }) => {
            return await eventsManager.getAllEvents(from, to);
        });
        
        ipcMain.handle('calendar:create-event', async (e, data) => {
            return await eventsManager.createEvent(data);
        });
        
        ipcMain.handle('calendar:update-event', async (e, data) => {
            return await eventsManager.updateEvent(data);
        });
        
        ipcMain.handle('calendar:delete-events', async (e, data) => {
            return await eventsManager.deleteEvents(data);
        });
        
        return eventsManager;
    }
    
    return {
        useEvents,
        closeDatabase: () => db.close(),
    };
}
