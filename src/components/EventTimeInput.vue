<script setup lang="ts">
    import { ref, watchEffect } from 'vue';
    import { DateTime } from 'luxon';

    interface Props {
        hideTime?: boolean,
    }

    const props = withDefaults(defineProps<Props>(), {
        hideTime: false,
    });

    const model = defineModel<DateTime | null>();

    const slots = defineSlots<{
        date: [],
        time: [],
    }>();

    const date = ref<string | null>();
    const time = ref<string | null>();

    watchEffect(() => {
        const dt = DateTime.fromISO(date.value);

        let hours = '0';
        let minutes = '0';

        if (time.value) {
            [ hours, minutes ] = time.value.split(':');
        }

        dt.set({ hour: Number(hours), minute: Number(minutes) })
            .startOf('minute');

        model.value = dt;
    });
</script>

<template>
    <div class="space-x-2">
        <input
            type="date"
            class="form-input"
            v-model.lazy="date"
            v-bind="$slots.date()[0]?.props ?? {}"
            required
        >

        <input
            v-show="!hideTime"
            type="time"
            class="form-input"
            v-model.lazy="time"
            v-bind="$slots.time()[0]?.props ?? {}"
            required
        >
    </div>
</template>

<style scoped>

</style>
