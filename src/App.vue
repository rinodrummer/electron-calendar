<script setup lang="ts">
    import { DateTime } from 'luxon';
    import { ref, unref, watch } from 'vue';
    import Calendar from './components/Calendar.vue';
    import Modal from './components/Modal.vue';
    import EventForm from './components/EventForm.vue';
    import { CalendarEventInput, CalendarView } from '../types.js';
    import { useManageEvents } from './composables/ManageEvents.js';

    const editingEvent = ref<CalendarEventInput | null>();

    const from = ref<DateTime | null>();
    const to = ref<DateTime | null>();

    const showEventForm = ref<boolean>(false);

    const notifyEventFormChannel = new MessageChannel();

    async function refreshAllEvents() {
        events.value = await getEventsByPeriod(from.value, to.value);
    }

    async function notifyEventFormReset() {
        showEventForm.value = false;
        notifyEventFormChannel.port1.postMessage('reset');

        await refreshAllEvents();
    }

    const {
        events,
        saveEvent,
        deleteEvent,
        getEventsByPeriod,
    } = useManageEvents({
        onSave: notifyEventFormReset,
        onDelete: notifyEventFormReset,
    });

    function setViewDates({ start, end }: { start: DateTime, end: DateTime, view: CalendarView }) {
        from.value = start;
        to.value = end;
    }

    watch([ from, to ], refreshAllEvents);

    window.ipcRenderer.on('ui@events:refresh', refreshAllEvents);
    window.ipcRenderer.on('ui@events:show-form', (_e, data) => {
        editingEvent.value = {
            ...data,
            start: DateTime.fromJSDate(data.start),
            end: DateTime.fromJSDate(data.end),
        };

        showEventForm.value = true;
    });
</script>

<template>
    <Calendar
        :events
        view="timeGridWeek"
        @save-event="(event, revert) => saveEvent(event, revert)"
        @view-changed="setViewDates"
        @show-event-form="(event) => {
            editingEvent = event;
            showEventForm = true;
        }"
    />

    <Modal v-model="showEventForm" id="event-form-modal">
        <template #header>
            <div class="flex justify-between items-center gap-2">
                <p
                    class="text-lg font-bold"
                    v-text="!editingEvent?.id ? 'Aggiungi un nuovo evento' : 'Modifica l\'evento'"
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
            :notify-reset="notifyEventFormChannel.port2"
            @save-event="saveEvent"
        />

        <template #footer>
            <div class="flex justify-between">
                <div>
                    <button
                        v-if="editingEvent?.id"
                        type="button"
                        @click="deleteEvent(editingEvent)"
                    >
                        Elimina evento
                    </button>
                </div>

                <button
                    type="submit"
                    form="event-form"
                    v-text="!editingEvent?.id ? 'Aggiungi' : 'Aggiorna'"
                ></button>
            </div>
        </template>
    </Modal>
</template>

<style>
    #event-form-modal {
        width: 90vw;
    }

    @media screen and (min-width: 728px) {
        #event-form-modal {
            width: 70vw;
        }
    }

    @media screen and (min-width: 1024px) {
        #event-form-modal {
            width: 50vw;
        }
    }
</style>
