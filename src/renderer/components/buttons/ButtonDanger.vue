<script setup lang="ts">
    import ButtonBase from './ButtonBase.vue';
</script>

<template>
    <button-base class="bg-red-500 text-white dark:text-white">
        <slot />
    </button-base>
</template>
