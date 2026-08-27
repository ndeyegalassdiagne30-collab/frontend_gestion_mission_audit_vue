<script setup>
import DrawerFooter from '@/components/ui/DrawerFooter.vue';

defineProps({
  client: { type: Object, required: true },
});

const emit = defineEmits(['fermer']);
</script>

<template>
  <form class="grid content-start gap-4" @submit.prevent="emit('fermer')">
    <div class="grid gap-3 text-sm text-slate-700">
      <p><strong class="text-slate-950">Raison sociale :</strong> {{ client.raison_sociale }}</p>
      <p><strong class="text-slate-950">NINEA :</strong> {{ client.ninea }}</p>
      <p><strong class="text-slate-950">Adresse :</strong> {{ client.adresse }}</p>
      <p><strong class="text-slate-950">Téléphone :</strong> {{ client.telephone }}</p>
      <p><strong class="text-slate-950">Email :</strong> {{ client.email }}</p>
      <p><strong class="text-slate-950">Date de création :</strong> {{ client.date_creation }}</p>
    </div>

    <DrawerFooter label="Fermer" icone="fa-xmark" @annuler="emit('fermer')" />
  </form>
</template>
