<script setup lang="ts">
    import EventTimeInput from './EventTimeInput.vue';
    import EventTimeInputAttrs from './EventTimeInputAttrs.vue';
    import { onMounted, ref, unref, watch } from 'vue';
    import { CalendarEventInput, Upsert } from '../../types.js';
    import { DateTime } from 'luxon';

    const props = defineProps<{
        event?: CalendarEventInput,
        notifyReset?: MessagePort,
    }>();

    const emit = defineEmits<{
        saveEvent: [ Upsert<'events'> ]
    }>();

    const form = ref<CalendarEventInput>(
        props.event ?? {}
    );

    function submitForm() {
        const {
            start,
            end,
            category,
            categoryID,
            allDay,
            ...event
        } = unref<CalendarEventInput>(form);

        emit('saveEvent', {
            ...event as Required<Upsert<'events'>>,
            is_all_day: Number(allDay),
            starts_at: start?.toMillis(),
            ends_at: end?.toMillis(),
            category_id: categoryID,
        });
    }

    onMounted(() => {
        if (props.notifyReset) {
            props.notifyReset.onmessage = (e) => {
                if (e.data === 'reset') {
                    form.value = {};
                }
            };
        }
    });

    watch(
        () => props.event,
        () => form.value = { ...props.event }
    );
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
                            :max="form.end?.toISODate()"
                        />
                    </template>

                    <template #time>
                        <EventTimeInputAttrs
                            aria-label="Ora di inizio dell'evento"
                            :min="form.end?.minus({ minute: 5 })
                                .setZone('utc', { keepLocalTime: true })
                                .toLocaleString(DateTime.TIME_24_SIMPLE)"
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
                            :min="form.start?.toISODate()"
                        />
                    </template>

                    <template #time>
                        <EventTimeInputAttrs
                            aria-label="Ora di fine dell'evento"
                            :min="form.start?.plus({ minute: 5 })
                                .setZone('utc', { keepLocalTime: true })
                                .toLocaleString(DateTime.TIME_24_SIMPLE)"
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
