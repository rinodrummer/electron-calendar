import { EventApi } from '@fullcalendar/core';
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

export interface Category {
export type Table<K extends keyof Tables> = Tables[K];
    id: number,
    name: string,
    color: string,
}

export interface ICalendarEvent extends EventApi {
    date?: Date | string | number,
    description?: string,
    categoryID?: Category['id'],
    category?: Category,
    categoryID?: Tables['categories']['id'],
    category?: Tables['categories'],
}

export type CalendarEvent = Partial<ICalendarEvent>;
