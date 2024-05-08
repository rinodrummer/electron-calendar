<script setup lang="ts">
    import { ref, watch } from 'vue';
    import { DateTime } from 'luxon';

    interface Props {
        hideTime?: boolean,
    }

    const props = withDefaults(defineProps<Props>(), {
        hideTime: false,
    });

    defineSlots<{
        date: [],
        time: [],
    }>();

    const model = defineModel<DateTime | null>();

    const date = ref<string | null>();
    const time = ref<string | null>();

    watch([ date, time ], ([ date, time ]) => {
        const dt = DateTime.fromISO(date);

        if (time) {
            const timeObj = DateTime.fromISO(time, { setZone: true });

            const { hour, minute } = timeObj;

            model.value = dt?.set({ hour, minute })
                .startOf('minute');
        }
    });

    watch(model, function (model) {
        model = model?.setZone('UTC', { keepLocalTime: true });

        date.value = model?.toISODate();
        time.value = model?.toLocaleString(DateTime.TIME_24_SIMPLE);
    }, { immediate: true });
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
