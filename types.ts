import { EventApi } from '@fullcalendar/core';

export interface Category {
    id: number,
    name: string,
    color: string,
}

export interface ICalendarEvent extends EventApi {
    date?: Date | string | number,
    description?: string,
    categoryID?: Category['id'],
    category?: Category,
}

export type CalendarEvent = Partial<ICalendarEvent>;
