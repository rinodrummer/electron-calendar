import { MaybeRefOrGetter, ref, toValue } from 'vue';
import { DateTime } from 'luxon';
import { CalendarEventInput, DateCompatible, Table, Upsert } from '../../types.js';

interface ComposableArgs {
    onSave?: (event: CalendarEventInput) => void,
    onDelete?: (event: CalendarEventInput) => void,
}

function getDateTime(date: DateCompatible): DateTime {
    if (typeof date === 'number') {
        return DateTime.fromMillis(date);
    }
    
    return date.includes('T') ?
        DateTime.fromISO(date) :
        DateTime.fromSQL(date);
}

function toMillis(date?: DateTime | DateCompatible): number | null {
    if (!date) {
        return null;
    }
    
    if (!(date instanceof DateTime)) {
        date = getDateTime(date);
    }
    
    return date.toMillis();
}

function hydrateEvent(event: Table<'events'>): CalendarEventInput {
    return {
        id: event.id?.toString(),
        title: event.title,
        description: event.description,
        allDay: Boolean(event.is_all_day ?? false),
        start: getDateTime(event.starts_at).toJSDate(),
        end: getDateTime(event.ends_at).toJSDate(),
        editable: true,
        startEditable: true,
        durationEditable: true,
    };
}

function dehydrateEvent(event: CalendarEventInput): Upsert<'events'> {
    const {
        start,
        end,
        category,
        categoryID,
        allDay,
        ...eventData
    } = event;
    
    return {
        ...eventData,
        is_all_day: Number(allDay),
        starts_at: toMillis(start as DateCompatible),
        ends_at: toMillis(end as DateCompatible),
        category_id: categoryID,
    } as Upsert<'events'>;
}

export function useManageEvents({ onSave, onDelete }: ComposableArgs) {
    const events = ref<CalendarEventInput[]>([]);
    
    async function saveEvent(event: MaybeRefOrGetter<CalendarEventInput>, revert?: () => void): Promise<boolean> {
        const eventData = dehydrateEvent(toValue(event))
        
        try {
            
            const calEvent = await window.ipcRenderer.invoke(
                eventData.id ? 'calendar:update-event' : 'calendar:create-event',
                eventData
            );
            
            if (onSave) {
                await onSave(calEvent);
            }
            
            return true;
        }
        catch (err) {
            console.log(err);
            
            if (revert) {
                revert();
            }
            
            return false;
        }
    }
    
    async function deleteEvent(event: MaybeRefOrGetter<CalendarEventInput>): Promise<boolean> {
        event = toValue<CalendarEventInput>(event);
        
        try {
            await window.ipcRenderer.invoke('calendar:delete-events', event.id);
            
            if (onDelete) {
                await onDelete(event);
            }
            
            return true;
        }
        catch (err) {
            return false;
        }
    }
    
    async function getEventsByPeriod(from: MaybeRefOrGetter<DateTime | null>, to: MaybeRefOrGetter<DateTime | null>): Promise<CalendarEventInput[]> {
        const fromVal = toValue(from);
        const toVal = toValue(to);
        
        if (!fromVal || !toVal) {
            return;
        }
        
        const rawEvents: Table<'events'>[] = await window.ipcRenderer.invoke('calendar:get-all-events', {
            from: fromVal.startOf('day').toMillis(),
            to: toVal.startOf('day').toMillis()
        });
        
        return rawEvents.map(hydrateEvent) as CalendarEventInput[];
    }
    
    return {
        events,
        saveEvent,
        deleteEvent,
        getEventsByPeriod,
    }
}
