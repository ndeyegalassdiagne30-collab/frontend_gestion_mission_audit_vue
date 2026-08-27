<script setup>
import { computed } from 'vue';
import { STATUT_MISSION_CLASSES, STATUT_MISSION_LABELS } from '@/utils/statuts.js';

// Pastille de statut d'une mission (en cours / en relecture / clôturée)
const props = defineProps({
  statut: { type: String, required: true },
  classeSupplementaire: { type: String, default: '' },
});

const label = computed(() => STATUT_MISSION_LABELS[props.statut] || props.statut);
const couleur = computed(
  () => STATUT_MISSION_CLASSES[props.statut] || 'bg-slate-100 text-slate-600',
);
</script>

<template>
  <span
    class="af-badge rounded-full px-2.5 py-1 text-xs font-bold"
    :class="[couleur, classeSupplementaire]"
  >
    {{ label }}
  </span>
</template>
