<script setup lang="ts">
    import EventTimeInput from './EventTimeInput.vue';
    import EventTimeInputAttrs from './EventTimeInputAttrs.vue';
    import { reactive, unref } from 'vue';
    import { CalendarEvent } from '../../types.js';
    import { formatDayString } from '@fullcalendar/core/internal.js';

    const props = defineProps<{ event?: CalendarEvent }>();

    const emit = defineEmits<{
        createEvent: [ CalendarEvent ]
    }>();

    const form = reactive<CalendarEvent>(
        props.event?.toPlainObject() ?? {}
    );

    function submitForm() {
        const event = unref<CalendarEvent>(form);

        if (event.allDay) {
            event.startStr = formatDayString(event.start);
            event.endStr = formatDayString(event.end);

            delete event.start;
            delete event.end;
        }

        emit('createEvent', event);
    }
</script>

<template>
    <form class="space-y-4" @submit.prevent="submitForm">
        <div class="form-control">
            <input
                class="form-input text-xl font-bold w-full"
                v-model.trim="form.title"
                minlength="1"
                maxlength="255"
                placeholder="Aggiungi il titolo dell'evento"
                aria-label="Titolo dell'evento da creare"
                required
            >
        </div>

        <div class="form-control">
            <label>
                <input
                    type="checkbox"
                    v-model="form.allDay"
                    :value="true"
                >

                &nbsp; Dura tutto il giorno
            </label>
        </div>

        <div class="flex gap-2 items-center" :class="{ 'justify-between': !form.allDay }">
            <div class="form-control flex gap-4 items-center">
                <p>Dal</p>

                <EventTimeInput v-model="form.start" :hide-time="form.allDay">
                    <template #date>
                        <EventTimeInputAttrs
                            aria-label="Data di inizio dell'evento"
                        />
                    </template>

                    <template #time>
                        <EventTimeInputAttrs
                            aria-label="Ora di inizio dell'evento"
                        />
                    </template>
                </EventTimeInput>
            </div>

            &ndash;

            <div class="form-control flex gap-4 items-center">
                <p>Al</p>

                <EventTimeInput v-model="form.end" :hide-time="form.allDay">
                    <template #date>
                        <EventTimeInputAttrs
                            aria-label="Data di fine dell'evento"
                        />
                    </template>

                    <template #time>
                        <EventTimeInputAttrs
                            aria-label="Ora di fine dell'evento"
                        />
                    </template>
                </EventTimeInput>
            </div>
        </div>

        <div class="form-control space-y-2">
            <label for="event-description">Descrizione:</label>

            <textarea
                id="event-description"
                class="form-textarea block w-full min-h-16"
                placeholder="Descrizione"
                v-model.trim="form.description"
            ></textarea>
        </div>

        <slot />
    </form>
</template>

<style scoped>

</style>
