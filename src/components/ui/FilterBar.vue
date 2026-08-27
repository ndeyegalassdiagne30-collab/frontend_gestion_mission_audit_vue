<script setup>
// Barre de filtre (menu déroulant) affichée au-dessus des tableaux.
// La valeur sélectionnée remonte à la page via v-model.
defineProps({
  placeholder: { type: String, default: '---Sélectionner par---' },
  options: { type: Array, default: () => [] },
});

// Number aussi : le filtre des documents porte sur des identifiants de mission
const valeur = defineModel({ type: [String, Number], default: '' });
</script>

<template>
  <div
    class="mb-6 flex flex-col gap-4 rounded-[2rem] bg-gradient-to-r from-brand via-brand to-brand-dark p-5 shadow-lg shadow-brand/20 sm:flex-row sm:items-center sm:justify-between"
  >
    <div class="flex items-center gap-2 text-sm font-bold text-white">
      <span class="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15">
        <i class="fa-solid fa-filter text-xs"></i>
      </span>
      <span>Filtrer</span>
    </div>

    <select
      v-model="valeur"
      aria-label="Filtrer"
      class="af-input w-full rounded-full border-0 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:ring-4 focus:ring-white/30 sm:w-72"
    >
      <option value="">{{ placeholder }}</option>
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
  </div>
</template>
