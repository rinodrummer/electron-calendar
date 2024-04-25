<script setup lang="ts">
    import { ref, watch } from 'vue';
    import Calendar from './components/Calendar.vue';
    import Modal from './components/Modal.vue';
    import EventForm from './components/EventForm.vue';
    import { CalendarEvent, CalendarEventInput, CalendarView } from '../types.js';
    import { EventInput } from '@fullcalendar/core';
    import { DateTime } from 'luxon';

    const events = ref<(CalendarEvent | EventInput)[]>([]);

    const from = ref<DateTime | null>();
    const to = ref<DateTime | null>();

    const showCreation = ref<boolean>(false);

    const notifyEventCreation = new MessageChannel();

    async function refreshAllEvents() {
        if (!from.value || !to.value) {
            return;
        }

        events.value = await window.ipcRenderer.invoke('calendar:get-all-events', {
            from: from.value.startOf('day').toSQL(window.dt.sqlOptions),
            to: to.value.endOf('day').toSQL(window.dt.sqlOptions)
        });
    }

    async function addEvent(event: CalendarEventInput) {
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
    <button @click="notifyEventCreation.port1.postMessage('reset')">Clear</button>

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
