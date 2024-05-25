<script setup lang="ts">
    import { useAttrs } from 'vue';

    const attrs = useAttrs();

    defineExpose({ attrs, });
</script>
