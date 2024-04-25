<script setup lang="ts">
    import { ref, watch } from 'vue';
    import Calendar from './components/Calendar.vue';
    import Modal from './components/Modal.vue';
    import { ref } from 'vue';
    import EventForm from './components/EventForm.vue';
    import { CalendarEvent, CalendarEventInput, CalendarView } from '../types.js';
    import { EventInput } from '@fullcalendar/core';
    import { DateTime } from 'luxon';

    const events = ref<(CalendarEvent | EventInput)[]>([]);

    const from = ref<DateTime | null>();
    const to = ref<DateTime | null>();

    const showCreation = ref<boolean>(false);

    function addEvent(event: CalendarEvent) {

    }

    async function addEvent(event: CalendarEventData) {
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
