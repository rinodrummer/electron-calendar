import { type Database } from 'sqlite';
import { Insert, Table } from '../../../types.js';
import { toPlaceholders } from '../database.js';

export function initEvents(db: Database) {
    async function getAllEvents(from: number, to: number) {
        const stmt = await db.prepare(
            `SELECT * FROM events
            WHERE starts_at >= ? AND events.ends_at < ?`
        );
        
        const results = await stmt.all<Table<'events'>[]>(
            from,
            to
        );
        
        await stmt.finalize();
        
        return results;
    }
    
    async function createEvent(event: Insert<'events'>) {
        const stmt = await db.prepare(
            `INSERT INTO events(title, description, starts_at, ends_at, is_all_day, category_id)
                VALUES ($title, $description, $starts_at, $ends_at, $is_all_day, $category_id)`
        );
        
        await stmt.run(toPlaceholders(event));
        
        await stmt.finalize();
    }
    
    async function updateEvent(event: Table<'events'>) {
        const stmt = await db.prepare(
            `UPDATE events SET
                    title = $title,
                    description = $description,
                    starts_at = $starts_at,
                    ends_at = $ends_at,
                    is_all_day = $is_all_day,
                    category_id = $category_id
                WHERE id = $id`
        );
        
        await stmt.run(toPlaceholders(event));
        
        await stmt.finalize();
    }
    
    async function deleteEvents(events: Table<'events'> | Table<'events'>[]) {
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
