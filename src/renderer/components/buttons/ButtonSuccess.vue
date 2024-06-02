<script setup lang="ts">
    import ButtonBase from './ButtonBase.vue';
</script>

<template>
    <button-base class="bg-green-500 text-white dark:text-white">
        <slot />
    </button-base>
</template>
