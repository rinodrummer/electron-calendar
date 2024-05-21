<script setup lang="ts">
    import { Calendar, type CalendarOptions, EventAddArg, EventDropArg, EventInput } from '@fullcalendar/core';
    import interactionPlugin, { EventReceiveArg, EventResizeDoneArg } from '@fullcalendar/interaction';
    import FullCalendar from '@fullcalendar/vue3';
    import dayGridPlugin from '@fullcalendar/daygrid';
    import timeGridPlugin from '@fullcalendar/timegrid';
    import listPlugin from '@fullcalendar/list';
    import luxonPlugin from '@fullcalendar/luxon3';
    import itLocale from '@fullcalendar/core/locales/it';
    import { reactive, ref, watch } from 'vue';
    import { DateTime } from 'luxon';
    import { CalendarEventInput, CalendarView } from '../../types.js';

    interface Props {
        events?: (CalendarEventInput)[],
        view: CalendarView
    }

    const props = withDefaults(defineProps<Props>(), {
        events: () => [],
    });

    const fullCalendar = ref<{ getApi(): Calendar } | null>();

    const emit = defineEmits<{
        showEventForm: [ event?: CalendarEventInput ],
        saveEvent: [ event: CalendarEventInput, revert?: () => void  ],
        deleteEvent: [ event: CalendarEventInput ],
        viewChanged: [ viewInfo: { start: DateTime, end: DateTime, view: CalendarView } ],
    }>();

    async function upsertEvent(eventName: string, { event, revert }: EventAddArg | EventReceiveArg) {
        console.log(event, revert);

        emit('saveEvent', {
            ...event.toPlainObject({
                collapseExtendedProps: true,
                collapseColor: true,
            }),
            start: DateTime.fromJSDate(event.start),
            end: DateTime.fromJSDate(event.end),
        }, revert);
    }

    const options = reactive<CalendarOptions>({
        events: props.events as EventInput,
        plugins: [
            luxonPlugin,
            dayGridPlugin,
            timeGridPlugin,
            listPlugin,
            interactionPlugin,
        ],
        customButtons: {
            addEvent: {
                text: 'Agg. nuovo',
                hint: 'Aggiungi un evento',
                click() {
                    emit('showEventForm');
                },
            }
        },
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'addEvent today dayGridMonth,timeGridWeek,timeGridDay,list',
        },
        businessHours: {
            daysOfWeek: [ 1, 2, 3, 4, 5 ],
            startTime: '7:00',
            endTime: '20:00',
        },
        slotLabelFormat: 'T',
        eventTimeFormat: 'T',
        initialView: props.view,
        nowIndicator: true,
        locale: itLocale,
        height: 'auto',
        droppable: true,
        eventResize: (eventInfo: EventResizeDoneArg) => upsertEvent('eventResize', eventInfo),
        eventDrop: (eventInfo: EventDropArg) => upsertEvent('eventDrop', eventInfo),
        eventReceive: (eventInfo: EventReceiveArg) => upsertEvent('eventReceive', eventInfo),
        datesSet({ start, end, view }) {
            emit('viewChanged', {
                start: DateTime.fromJSDate(start),
                end: DateTime.fromJSDate(end),
                view: view.type as CalendarView
            });
        },
        eventDidMount(eventMount) {
            const event = eventMount.event.toPlainObject({
                collapseExtendedProps: true,
                collapseColor: true,
            });

            eventMount.el.addEventListener('dblclick', () => {
                emit('showEventForm', {
                    ...event,
                    id: Number(event.id),
                    start: DateTime.fromISO(event.start),
                    end: DateTime.fromISO(event.end),
                } as CalendarEventInput);
            }, false);

            eventMount.el.addEventListener('contextmenu', async (e) => {
                window.ipcRenderer.send('event:show-ctx-menu', {
                    event: {
                        ...event,
                        start: DateTime.fromISO(event.start).toJSDate(),
                        end: DateTime.fromISO(event.end).toJSDate(),
                    },
                    position: {
                        x: e.x,
                        y: e.y,
                    }
                });
            }, false);
        },
    });

    watch(() => props.events, (events) => {
        options.events = events as EventInput[];

        fullCalendar.value?.getApi().refetchEvents();
    });
</script>

<template>
    <FullCalendar :options ref="fullCalendar">
        <template v-slot:eventContent="arg">
            <p>{{ arg.timeText }}</p>

            <i>{{ arg.event.title }}</i>
        </template>
    </FullCalendar>
</template>

<style scoped>

</style>
