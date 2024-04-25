<script setup lang="ts">
    import { ref, watchEffect } from 'vue';

    interface Props {
        hideTime?: boolean,
    }

    const props = withDefaults(defineProps<Props>(), {
        hideTime: false,
    });

    const model = defineModel<Date | string | number | null>();

    const slots = defineSlots<{
        date: [],
        time: [],
    }>();

    const date = ref<string | null>();
    const time = ref<string | null>();

    watchEffect(() => {
        const dt = new Date(date.value);

        let hours = '0';
        let minutes = '0';

        if (time.value) {
            [ hours, minutes ] = time.value.split(':');
        }

        dt.setHours(Number(hours));
        dt.setMinutes(Number(minutes));
        dt.setSeconds(0);
        dt.setMilliseconds(0);

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
