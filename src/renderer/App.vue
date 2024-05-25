<script setup lang="ts">
    import { DateTime } from 'luxon';
    import { ref, unref, watch } from 'vue';
    import Calendar from './components/VCalendar.vue';
    import Modal from './components/VModal.vue';
    import EventForm from './components/EventForm.vue';
    import VButton from './components/buttons/ButtonBase.vue';
    import VButtonDanger from './components/buttons/ButtonDanger.vue';
    import VButtonSuccess from './components/buttons/ButtonSuccess.vue';
    import { CalendarEvent, CalendarEventInput, CalendarView } from '../types.js';
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

                <v-button
                    type="button"
                    class="bg-gray-200 font-bold text-lg align-middle"
                    @click.prevent="showEventForm = false"
                >
                    &times;
                </v-button>
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
                    <v-button-danger
                        v-if="editingEvent?.id"
                        @click="deleteEvent(editingEvent as CalendarEvent)"
                    >
                        Elimina evento
                    </v-button-danger>
                </div>

                <v-button-success
                    type="submit"
                    form="event-form"
                    v-text="!editingEvent?.id ? 'Aggiungi' : 'Aggiorna'"
                ></v-button-success>
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
