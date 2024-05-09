<script setup lang="ts">
    import { Calendar, type CalendarOptions, EventInput } from '@fullcalendar/core';
    import FullCalendar from '@fullcalendar/vue3';
    import dayGridPlugin from '@fullcalendar/daygrid';
    import timeGridPlugin from '@fullcalendar/timegrid';
    import listPlugin from '@fullcalendar/list';
    import interactionPlugin from '@fullcalendar/interaction';
    import luxonPlugin from '@fullcalendar/luxon3';
    import itLocale from '@fullcalendar/core/locales/it';
    import { reactive, ref, watch } from 'vue';
    import { DateTime } from 'luxon';
    import { CalendarEvent, CalendarView } from '../../types.js';

    interface Props {
        events?: (CalendarEvent | EventInput)[],
        view: CalendarView
    }

    const props = withDefaults(defineProps<Props>(), {
        events: () => [],
    });

    const fullCalendar = ref<{ getApi(): Calendar } | null>();

    const emit = defineEmits<{
        showEventForm: [ event?: CalendarEvent ],
        updateEvent: [ event: CalendarEvent ],
        deleteEvent: [ event: CalendarEvent ],
        viewChanged: [ viewInfo: { start: DateTime, end: DateTime, view: CalendarView } ],
    }>();

    const options = reactive<CalendarOptions>({
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
        events: props.events as EventInput,
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
                } as CalendarEvent);
            }, false);

            eventMount.el.addEventListener('contextmenu', async (e) => {
                window.ipcRenderer.send('event:show-ctx-menu', {
                    event: {
                        ...event,
                        start: DateTime.fromISO(event.start),
                        end: DateTime.fromISO(event.end),
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
