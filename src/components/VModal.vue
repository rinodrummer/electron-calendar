<script setup lang="ts">
    import { onMounted, onUnmounted, ref, watch } from 'vue';

    const open = defineModel<boolean>({
        default: false
    });

    defineSlots<{
        header: any,
        default: any,
        footer: any,
    }>();

    const dialog = ref<HTMLDialogElement | null>(null);

    watch(open, (open) => open ?
        dialog.value?.showModal() :
        dialog.value?.close()
    );

    function setModalClosedOnEsc(e: KeyboardEvent) {
        if (e.key === 'Escape') {
            open.value = false;
        }
    }

    onMounted(() => {
        document.addEventListener('keydown', setModalClosedOnEsc);
    });

    onUnmounted(() => {
        document.removeEventListener('keydown', setModalClosedOnEsc);
    });
</script>

<template>
    <dialog ref="dialog" class="modal">
        <header v-if="$slots.header" class="modal-header">
            <slot name="header" />
        </header>

        <main class="modal-content">
            <slot />
        </main>

        <footer v-if="$slots.footer" class="modal-footer">
            <slot name="footer" />
        </footer>
    </dialog>
</template>

<style scoped>
    .modal:modal {
        .modal[open],
        .modal.open {
            min-width: 320px;
            max-width: 90vw;
            max-height: 90dvh;
        }
    }

    .modal[open],
    .modal.open {
        border: none;
        outline: none;
        @apply flex flex-col overflow-hidden rounded-xl shadow-2xl border-0 outline-0;

        .modal-header,
        .modal-content,
        .modal-footer {
            @apply py-4 px-8 bg-white dark:bg-gray-800 dark:text-white;
        }

        .modal-content {
            flex: 1;
            max-height: 90%;
            @apply overflow-auto;
        }
    }
</style>
