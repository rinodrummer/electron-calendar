import { type Database } from 'sqlite';
import { Insert, Table } from '../../types.js';
import { toPlaceholders } from '../database.js';

type EventIdentifier = Table<'events'> | Table<'events'>['id'];

export interface EventsManager {
    getEvent(id: Table<'events'>['id']): Promise<Table<'events'>>,
    getAllEvents(from: number, to: number): Promise<Table<'events'>[]>,
    createEvent(event: Insert<'events'>): Promise<Table<'events'>>,
    updateEvent(event: Table<'events'>): Promise<Table<'events'>>,
    deleteEvents(events: EventIdentifier|EventIdentifier[]): Promise<void>,
}

export function initEvents(db: Database): EventsManager {
    async function getAllEvents(from: number, to: number): Promise<Table<'events'>[]> {
        try {
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
        catch (err) {
            throw err;
        }
    }
    
    async function getEvent(id: Table<'events'>['id']): Promise<Table<'events'>> {
        try {
            const stmt = await db.prepare(
                `SELECT * FROM events WHERE id = ?`
            );
            
            const results = await stmt.get<Table<'events'>>(id);
            
            await stmt.finalize();
            
            return results;
        }
        catch (err) {
            throw err;
        }
    }
    
    async function createEvent(event: Insert<'events'>): Promise<Table<'events'>> {
        try {
            const stmt = await db.prepare(
                `INSERT INTO events(title, description, starts_at, ends_at, is_all_day, category_id)
             VALUES ($title, $description, $starts_at, $ends_at, $is_all_day, $category_id)`
            );
            
            const result = await stmt.run(toPlaceholders(event));
            
            await stmt.finalize();
            
            return await getEvent(result.lastID);
        }
        catch (err) {
            throw err;
        }
    }
    
    async function updateEvent(event: Table<'events'>): Promise<Table<'events'>> {
        try {
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
            
            const res = await stmt.run(toPlaceholders(event));
            
            await stmt.finalize();
            
            return await getEvent(res.lastID);
        }
        catch (err) {
            throw err;
        }
    }
    
    async function deleteEvents(events: EventIdentifier|EventIdentifier[]): Promise<void> {
        if (!Array.isArray(events)) {
            events = [ events ];
        }
        
        events = events.map((event: EventIdentifier) => {
            if (typeof event === 'object') {
                return event.id;
            }
            
            return event;
        })
        
        try {
            const stmt = await db.prepare(
                `DELETE FROM events WHERE id IN (?)`
            );
            
            await stmt.run(events.join(', '));
            
            await stmt.finalize();
        }
        catch (err) {
            throw err;
        }
    }
    
    return {
        getEvent,
        getAllEvents,
        createEvent,
        updateEvent,
        deleteEvents
    }
}
