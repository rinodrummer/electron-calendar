import { EventApi } from '@fullcalendar/core';
import { DateTime } from 'luxon';

export type CalendarView = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'list';

export type DateCompatible = string | number;
export type BaseCalendarEvent = Pick<EventApi, 'title' | 'allDay'>;

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
        is_all_day?: boolean,
        category_id?: number,
        created_at?: DateCompatible,
        updated_at?: DateCompatible,
    }
};

export type Table<K extends keyof Tables> = Tables[K];

export interface CalendarEvent extends BaseCalendarEvent {
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
