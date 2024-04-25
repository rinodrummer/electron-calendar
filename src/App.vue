<script setup lang="ts">
    import Calendar from './components/Calendar.vue';
    import Modal from './components/Modal.vue';
    import { ref } from 'vue';
    import EventForm from './components/EventForm.vue';
    import { CalendarEvent } from '../types.js';

    const events: CalendarEvent[] = [];

    const showCreation = ref<boolean>(false);

    function addEvent(event: CalendarEvent) {

    }
</script>

<template>
    <Calendar
        :events
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
