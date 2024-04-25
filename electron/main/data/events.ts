import { type Database } from 'sqlite';
import { CalendarEvent, CalendarEventInput, Table } from '../../../types.js';
import { DateTime } from 'luxon';

const dtSqlOptions = {
    includeOffset: false,
    includeOffsetSpace: false,
    includeZone: false
};

export function initEvents(db: Database) {
    async function getAllEvents(from: string, to: string) {
        const stmt = await db.prepare(
            `SELECT * FROM events`
            //WHERE starts_at >= ? AND events.ends_at < ?
        );
        
        const results = await stmt.all<Table<'events'>[]>();
        
        await stmt.finalize();
        
        return results;
    }
    
    async function createEvent(event: CalendarEventInput) {
        const stmt = await db.prepare(
            `INSERT INTO events(title, description, starts_at, ends_at, is_all_day, category_id)
                VALUES (?, ?, ?, ?, ?, ?)`
        );
        
        await stmt.run(
            event.title,
            event.description,
            event.start.startOf('minute').toSQL(dtSqlOptions),
            event.end.endOf('minute').toSQL(dtSqlOptions),
            event.allDay,
            event.categoryID
        );
        
        await stmt.finalize();
    }
    
    async function updateEvent(event: CalendarEvent) {
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
        
        const start = event.start instanceof DateTime ? event.start : DateTime.fromJSDate(event.start);
        const end = event.end instanceof DateTime ? event.end : DateTime.fromJSDate(event.end);
        
        await stmt.run(
            event.title,
            event.description,
            start.startOf('minute').toSQL(dtSqlOptions),
            end.startOf('minute').toSQL(dtSqlOptions),
            event.allDay,
            event.categoryID,
            event.id
        );
        
        await stmt.finalize();
    }
    
    async function deleteEvents(events: CalendarEvent | CalendarEvent[]) {
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
