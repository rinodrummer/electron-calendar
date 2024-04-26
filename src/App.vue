<script setup lang="ts">
    import { EventInput } from '@fullcalendar/core';
    import { DateTime } from 'luxon';
    import { ref, watch } from 'vue';
    import Calendar from './components/Calendar.vue';
    import Modal from './components/Modal.vue';
    import EventForm from './components/EventForm.vue';
    import { CalendarEvent, CalendarView, DateCompatible, Insert, Table } from '../types.js';

    const events = ref<(CalendarEvent | EventInput)[]>([]);

    const from = ref<DateTime | null>();
    const to = ref<DateTime | null>();

    const showCreation = ref<boolean>(false);

    const notifyEventCreation = new MessageChannel();

    function getDateTime(date: DateCompatible): DateTime {
        return typeof date === 'number' ?
            DateTime.fromMillis(date) :
            DateTime.fromSQL(date.toString());
    }

    async function refreshAllEvents() {
        if (!from.value || !to.value) {
            return;
        }

        const rawEvents: Table<'events'>[] = await window.ipcRenderer.invoke('calendar:get-all-events', {
            from: from.value.startOf('day').toSQL(window.dt.sqlOptions),
            to: to.value.endOf('day').toSQL(window.dt.sqlOptions)
        });

        events.value = rawEvents.map((event) => ({
            id: event.id,
            title: event.title,
            description: event.description,
            allDay: Boolean(event.is_all_day ?? false),
            start: getDateTime(event.starts_at).toJSDate(),
            end: getDateTime(event.ends_at).toJSDate(),
            editable: true,
            startEditable: true,
            durationEditable: true,
        }));
    }

    async function addEvent(event: Insert<'events'>) {
        await window.ipcRenderer.invoke('calendar:create-event', event);

        showCreation.value = false;
        notifyEventCreation.port1.postMessage('reset');

        await refreshAllEvents();
    }

    function setViewDates({ start, end }: { start: DateTime, end: DateTime, view: CalendarView }) {
        from.value = start;
        to.value = end;
    }

    watch([ from, to ], refreshAllEvents);
</script>

<template>
    <Calendar
        :events
        view="timeGridWeek"
        @view-changed="setViewDates"
        @show-event-creation="() => showCreation = true"
    />

    <Modal v-model="showCreation" id="create-event-modal">
        <template #header>
            <div class="flex justify-between items-center gap-2">
                <p class="text-lg font-bold">Aggiungi un nuovo evento</p>

                <button
                    type="button"
                    @click.prevent="showCreation = false"
                >
                    &times;
                </button>
            </div>
        </template>

        <EventForm
            id="create-event-form"
            :notify-reset="notifyEventCreation.port2"
            @create-event="addEvent"
        />

        <template #footer>
            <div class="flex justify-end">
                <button type="submit" form="create-event-form">Aggiungi</button>
            </div>
        </template>
    </Modal>
</template>

<style>
    #create-event-modal {
        width: 50vw;
    }
</style>
