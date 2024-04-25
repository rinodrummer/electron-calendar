import { type Database } from 'sqlite';
import { CalendarEvent, ICalendarEvent } from '../../../types.js';

export function initEvents(db: Database) {
    async function getAllEvents(from: Date, to: Date = new Date()) {
        const stmt = await db.prepare(
            `SELECT * FROM events
            WHERE starts_at >= ? AND events.ends_at <= ?`
        );
        
        const results = await stmt.all<CalendarEvent[]>(
            from.toDateString() + ' 00:00:00',
            to.toDateString() + ' 23:59:59',
        );
        
        await stmt.finalize();
        
        return results;
    }
    
    async function createEvent(event: CalendarEvent) {
        const stmt = await db.prepare(
            `INSERT INTO events(title, description, starts_at, ends_at, is_all_day, category_id)
                VALUES (?, ?, ?, ?, ?, ?)`
        );
        
        await stmt.run(
            event.title,
            event.description,
            event.start,
            event.end,
            event.allDay,
            event.categoryID
        );
        
        await stmt.finalize();
    }
    
    async function updateEvent(event: ICalendarEvent) {
        const stmt = await db.prepare(
            `UPDATE events SET
                    title = ?,
                    description = ?,
                    starts_at = ?,
                    ends_at = ?,
                    is_all_day = ?,
                    category_id = ?
                WHERE id = ?`
        );
        
        await stmt.run(
            event.title,
            event.description,
            event.start,
            event.end,
            event.allDay,
            event.categoryID,
            event.id
        );
        
        await stmt.finalize();
    }
    
    async function deleteEvents(events: ICalendarEvent|ICalendarEvent[]) {
        if (!Array.isArray(events)) {
            events = [ events ];
        }
        
        const stmt = await db.prepare(
            `DELETE FROM events WHERE id IN (?)`
        );
        
        await stmt.run(
            events.map((event) => event.id).join(', ')
        );
        
        await stmt.finalize();
    }
    
    return {
        getAllEvents,
        createEvent,
        updateEvent,
        deleteEvents
    }
}
