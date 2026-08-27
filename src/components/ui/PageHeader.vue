<script setup>
// En-tête commun à toutes les pages : titre + bouton d'action facultatif
defineProps({
  titre: { type: String, required: true },
  actionLabel: { type: String, default: null },
  actionIcone: { type: String, default: 'fa-plus' },
});

defineEmits(['action']);
</script>

<template>
  <header
    class="af-card mb-6 flex flex-col gap-4 rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between"
  >
    <h1 class="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
      {{ titre }}
    </h1>

    <button
      v-if="actionLabel"
      type="button"
      @click="$emit('action')"
      class="af-btn-primary inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-extrabold text-white"
    >
      <i class="fa-solid" :class="actionIcone"></i>
      <span>{{ actionLabel }}</span>
    </button>
  </header>
</template>
