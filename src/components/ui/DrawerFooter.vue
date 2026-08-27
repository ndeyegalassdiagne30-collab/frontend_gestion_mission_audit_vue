<script setup>
// Pied de formulaire commun à tous les panneaux latéraux :
// « Annuler » ferme le panneau, le second bouton soumet le formulaire.
defineProps({
  label: { type: String, default: 'Enregistrer' },
  icone: { type: String, default: 'fa-floppy-disk' },
  labelAnnuler: { type: String, default: 'Annuler' },
  chargement: { type: Boolean, default: false },
});

defineEmits(['annuler']);
</script>

<template>
  <div class="mt-2 flex justify-end gap-3">
    <button
      type="button"
      @click="$emit('annuler')"
      class="af-btn-ghost rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
    >
      {{ labelAnnuler }}
    </button>

    <button
      type="submit"
      :disabled="chargement"
      class="af-btn-primary inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-extrabold text-white"
    >
      <template v-if="chargement">
        <div class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></div>
        <span>Enregistrement...</span>
      </template>

      <template v-else>
        <i class="fa-solid" :class="icone"></i>
        <span>{{ label }}</span>
      </template>
    </button>
  </div>
</template>
