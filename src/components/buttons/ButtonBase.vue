<script setup lang="ts">
    import { twMerge } from 'tailwind-merge';
</script>

<template>
    <button :class="twMerge('bg-gray-300 dark:text-black', $attrs.class as string)" type="button">
        <slot />
    </button>
</template>

<style scoped>
    button {
        @apply rounded-lg border-[1px] border-transparent cursor-pointer font-medium py-2 px-4;
        font-size: 1em;
        font-family: inherit;
        transition: border-color 0.25s;
    }

    button:focus,
    button:focus-visible {
        outline: 4px auto -webkit-focus-ring-color;
    }

    button.disabled,
    button:disabled {
        @apply cursor-not-allowed;
        pointer-events: none;
    }
</style>
