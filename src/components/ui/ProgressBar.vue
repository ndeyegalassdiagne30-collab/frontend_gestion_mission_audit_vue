<script setup>
import { computed } from 'vue';

// Barre d'avancement d'une mission, avec le pourcentage à droite
const props = defineProps({
  avancement: { type: [Number, String], default: 0 },
  largeur: { type: String, default: 'w-12' },
});

const pourcentage = computed(
  () => Math.min(100, Math.max(0, Number(props.avancement) || 0)),
);
</script>

<template>
  <div class="flex items-center gap-1.5">
    <div class="af-progress-track h-2 shrink-0 overflow-hidden rounded-full" :class="largeur">
      <div class="af-progress-bar h-full rounded-full" :style="{ width: `${pourcentage}%` }"></div>
    </div>

    <span class="text-xs font-bold text-slate-600">{{ avancement }}%</span>
  </div>
</template>
