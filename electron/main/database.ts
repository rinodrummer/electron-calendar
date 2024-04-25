import { ipcMain } from 'electron';
import { Database } from 'sqlite';
import { initEvents } from './data/events.js';
import { getSqlite3 } from './sqlite3.js';
import { CalendarEvent } from '../../types.js';
import { EventInput } from '@fullcalendar/core';
import { DateTime } from 'luxon';

let db: Database = null;

export default async function initDatabase() {
    db = await getSqlite3();
    
    function useEvents() {
        const eventsManager = initEvents(db);
        
        ipcMain.handle('calendar:get-all-events', async (e, { from, to }) => {
            const result = await eventsManager.getAllEvents(from, to);
            
            result.map<CalendarEvent | EventInput>((event) => ({
                id: event.id,
                title: event.title,
                description: event.description,
                start: DateTime.fromSQL(event.starts_at.toString()),
                end: DateTime.fromSQL(event.starts_at.toString()),
                allDay: event.is_all_day,
                editable: true,
                startEditable: true,
                durationEditable: true,
            }));
            
            return result;
        });
        
        ipcMain.handle('calendar:create-event', async (e, data) => {
            console.log(data);
            
            return await eventsManager.createEvent(data);
        });
        
        ipcMain.handle('calendar:update-event', async (e, data) => {
            return await eventsManager.updateEvent(data);
        });
        
        ipcMain.handle('calendar:delete-events', async (e, data) => {
            return await eventsManager.deleteEvents(data);
        });
    }
    
    return {
        useEvents,
        closeDatabase: () => db.close(),
    };
}
