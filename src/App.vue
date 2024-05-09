<script setup lang="ts">
    import { EventInput } from '@fullcalendar/core';
    import { DateTime } from 'luxon';
    import { ref, unref, watch } from 'vue';
    import Calendar from './components/Calendar.vue';
    import Modal from './components/Modal.vue';
    import EventForm from './components/EventForm.vue';
    import { CalendarEvent, CalendarView, DateCompatible, Insert, Table } from '../types.js';

    const events = ref<(CalendarEvent | EventInput)[]>([]);

    const editingEvent = ref<CalendarEvent | EventInput | null>();

    const from = ref<DateTime | null>();
    const to = ref<DateTime | null>();

    const showEventForm = ref<boolean>(false);

    const notifyEventForm = new MessageChannel();

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
            from: from.value.startOf('day').toMillis(),
            to: to.value.startOf('day').toMillis()
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
        try {
            await window.ipcRenderer.invoke('calendar:create-event', event);

            showEventForm.value = false;
            notifyEventForm.port1.postMessage('reset');

            await refreshAllEvents();
        }
        catch (err) {}
    }

    async function updateEvent(event: Table<'events'>) {
        try {
            await window.ipcRenderer.invoke('calendar:update-event', event);

            showEventForm.value = false;
            notifyEventForm.port1.postMessage('reset');

            await refreshAllEvents();
        }
        catch (err) {}
    }

    async function deleteEvent(event: CalendarEvent | EventInput) {
        try {
            await window.ipcRenderer.invoke('calendar:delete-events', event.id);

            showEventForm.value = false;
            notifyEventForm.port1.postMessage('reset');

            await refreshAllEvents();
        }
        catch (err) {}
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
        @show-event-form="(event) => {
            editingEvent = event;
            showEventForm = true;
        }"
    />

    <Modal v-model="showEventForm" id="create-event-modal">
        <template #header>
            <div class="flex justify-between items-center gap-2">
                <p
                    class="text-lg font-bold"
                    v-text="!editingEvent ? 'Aggiungi un nuovo evento' : 'Modifica l\'evento'"
                ></p>

                <button
                    type="button"
                    @click.prevent="showEventForm = false"
                >
                    &times;
                </button>
            </div>
        </template>

        <EventForm
            id="event-form"
            :event="unref(editingEvent)"
            :notify-reset="notifyEventForm.port2"
            @save-event="(calEvent) => calEvent.id ? updateEvent(calEvent as Table<'events'>) : addEvent(calEvent)"
        />

        <template #footer>
            <div class="flex justify-between">
                <div>
                    <button
                        v-if="editingEvent"
                        type="button"
                        @click="deleteEvent(editingEvent)"
                    >
                        Elimina evento
                    </button>
                </div>

                <button
                    type="submit"
                    form="event-form"
                    v-text="!editingEvent ? 'Aggiungi' : 'Aggiorna'"
                ></button>
            </div>
        </template>
    </Modal>
</template>

<style>
    #create-event-modal {
        width: 50vw;
    }
</style>
