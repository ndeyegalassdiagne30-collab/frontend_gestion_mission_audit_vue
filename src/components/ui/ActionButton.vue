<script setup>
// Bouton d'action rond réutilisé dans tous les tableaux (voir / modifier / supprimer)
defineProps({
  icone: { type: String, required: true },
  couleur: { type: String, default: 'bg-slate-100 text-slate-600' },
  titre: { type: String, default: '' },
});
</script>

<template>
  <button
    type="button"
    :title="titre"
    class="af-btn-icon flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
    :class="couleur"
  >
    <i class="fa-solid text-xs" :class="icone"></i>
  </button>
</template>
