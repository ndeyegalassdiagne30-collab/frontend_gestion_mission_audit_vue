<script setup>
import { computed, ref, watch } from 'vue';
import { aUnePhoto, initiales } from '@/utils/format.js';

// Avatar réutilisé dans l'en-tête, le tableau des utilisateurs, la page profil
// et le sélecteur d'auditeurs. `taille` accepte aussi des classes en plus
// (ex: "mx-auto h-10 w-10").
const props = defineProps({
  utilisateur: { type: Object, default: null },
  taille: { type: String, default: 'h-10 w-10' },
  texte: { type: String, default: 'text-sm font-bold' },
  fond: { type: String, default: 'bg-brand/10 text-brand' },
  anneau: { type: Boolean, default: true },
  secours: { type: String, default: 'U' },
});

// Une URL Cloudinary peut être cassée : on retombe alors sur les initiales.
const erreurImage = ref(false);

watch(() => props.utilisateur?.photo, () => {
  erreurImage.value = false;
});

const photo = computed(
  () => (!erreurImage.value && aUnePhoto(props.utilisateur) ? props.utilisateur.photo : null),
);

const lettres = computed(() => initiales(props.utilisateur) || props.secours);
</script>

<template>
  <img
    v-if="photo"
    :src="photo"
    :alt="`Photo de ${utilisateur.prenom} ${utilisateur.nom}`"
    class="shrink-0 rounded-full object-cover"
    :class="[taille, { 'af-avatar-ring': anneau }]"
    @error="erreurImage = true"
  />

  <span
    v-else
    class="inline-flex shrink-0 items-center justify-center rounded-full"
    :class="[taille, texte, fond, { 'af-avatar-ring': anneau }]"
  >
    {{ lettres }}
  </span>
</template>
