import { EventApi } from '@fullcalendar/core';
import { DateTime } from 'luxon';

export type CalendarView = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'list';

export type DateCompatible = string | number;

export type Tables = {
    categories: {
        id: number,
        name: string,
        color: string,
        created_at?: DateCompatible,
        updated_at?: DateCompatible,
    },
    events: {
        id: number,
        title: string,
        description?: string,
        starts_at: DateCompatible,
        ends_at: DateCompatible,
        is_all_day?: number,
        category_id?: number,
        created_at?: DateCompatible,
        updated_at?: DateCompatible,
    }
};

export type Table<K extends keyof Tables> = Tables[K];
export type Insert<K extends keyof Tables> = Omit<Tables[K], 'id'>;
export type Upsert<K extends keyof Tables> = Insert<K> & { id?: Table<K>['id'] };

export interface CalendarEvent extends Pick<EventApi, 'title' | 'allDay'> {
    id: number,
    description?: string,
    start: DateTime | EventApi['start'],
    end: DateTime | EventApi['end'],
    categoryID?: Tables['categories']['id'],
    category?: Tables['categories'],
}

export interface CalendarEventInput extends Partial<CalendarEvent> {
    start?: DateTime,
    end?: DateTime,
}
