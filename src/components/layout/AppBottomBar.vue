<script setup>
import { RouterLink, useRoute } from 'vue-router';
import { useNavigation } from '@/composables/useNavigation.js';

// « Plus » ouvre la barre latérale, qui contient les liens restants et la
// déconnexion : aucun duplicata de menu à maintenir.
defineEmits(['ouvrir-menu']);

const route = useRoute();
const { onglets } = useNavigation();
</script>

<template>
  <nav
    class="af-bottom-bar fixed inset-x-0 bottom-0 z-20 lg:hidden"
    aria-label="Navigation principale"
  >
    <div class="flex items-stretch gap-1 px-2 pt-1.5">
      <RouterLink
        v-for="onglet in onglets"
        :key="onglet.nom"
        :to="{ name: onglet.nom }"
        class="af-tab"
        :class="{ 'is-active': route.name === onglet.nom }"
        :aria-current="route.name === onglet.nom ? 'page' : undefined"
      >
        <i class="fa-solid" :class="onglet.icone"></i>
        <span>{{ onglet.court }}</span>
      </RouterLink>

      <button type="button" class="af-tab" @click="$emit('ouvrir-menu')">
        <i class="fa-solid fa-ellipsis"></i>
        <span>Plus</span>
      </button>
    </div>
  </nav>
</template>
