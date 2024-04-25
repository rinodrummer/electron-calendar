import { ipcMain } from 'electron';
import { Database } from 'sqlite';
import { initEvents } from './data/events.js';
import { getSqlite3 } from './sqlite3.js';

let db: Database = null;

export default async function initDatabase() {
    db = await getSqlite3();
    
    function useEvents() {
        const eventsManager = initEvents(db);
        
        ipcMain.on('calendar:create-event', async (e, data) => {
            await eventsManager.createEvent(data);
            
            e.reply('calendar:create-event');
        });
        
        ipcMain.on('calendar:update-event', async (e, data) => {
            await eventsManager.updateEvent(data);
            
            e.reply('calendar:update-event');
        });
        
        ipcMain.on('calendar:get-all-eventsManager', async (e, data) => {
            const events = await eventsManager.getAllEvents(data);
            
            e.reply('calendar:all-eventsManager', events);
        });
    }
    
    return {
        useEvents,
        closeDatabase: () => db.close(),
    };
}
