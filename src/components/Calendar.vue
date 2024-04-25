<script setup lang="ts">
    import { type CalendarOptions, EventInput } from '@fullcalendar/core';
    import FullCalendar from '@fullcalendar/vue3';
    import dayGridPlugin from '@fullcalendar/daygrid';
    import timeGridPlugin from '@fullcalendar/timegrid';
    import listPlugin from '@fullcalendar/list';
    import interactionPlugin from '@fullcalendar/interaction';
    import luxonPlugin from '@fullcalendar/luxon3';
    import itLocale from '@fullcalendar/core/locales/it';
    import { DateTime } from 'luxon';
    import { CalendarEvent, CalendarView } from '../../types.js';

    interface Props {
        events?: CalendarEvent[],
        view: CalendarView
    }

    const props = withDefaults(defineProps<Props>(), {
        events: () => [],
    });

    const emit = defineEmits<{
        showEventCreation: [],
        updateEvent: [ event: CalendarEvent ],
        deleteEvent: [ event: CalendarEvent ],
        viewChanged: [ viewInfo: { start: DateTime, end: DateTime, view: CalendarView } ],
    }>();

    const options: CalendarOptions = {
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
                    emit('showEventCreation');
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
        events: props.events as EventInput,
        datesSet({ start, end, view }) {
            emit('viewChanged', {
                start: DateTime.fromJSDate(start),
                end: DateTime.fromJSDate(end),
                view: view.type as CalendarView
            });
        },
    };
</script>

<template>
    <FullCalendar :options>
        <template v-slot:eventContent="arg">
            <b>{{ arg.timeText }}</b>
            <i>{{ arg.event.title }}</i>
        </template>
    </FullCalendar>
</template>

<style scoped>

</style>
