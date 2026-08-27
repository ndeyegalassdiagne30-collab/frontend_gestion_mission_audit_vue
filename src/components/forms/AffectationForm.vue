<script setup>
import { ref } from 'vue';

import DrawerFooter from '@/components/ui/DrawerFooter.vue';
import AuditeurSelect from '@/components/ui/AuditeurSelect.vue';

import { useToast } from '@/composables/useToast.js';
import * as missionService from '@/services/missionService.js';

// Permet à l'expert-comptable de gérer les auditeurs affectés à une mission
const props = defineProps({
  mission: { type: Object, required: true },
  auditeurs: { type: Array, default: () => [] },
  onSucces: { type: Function, default: null },
});

const emit = defineEmits(['fermer']);

const { succes, erreur: toastErreur } = useToast();

const selection = ref([...(props.mission.auditeurs || [])]);
const chargement = ref(false);

async function soumettre() {
  chargement.value = true;

  try {
    await missionService.affecterAuditeurs(props.mission.id, selection.value);
    succes('Affectation mise à jour avec succès.');
    await props.onSucces?.();
    emit('fermer');
  } catch (erreur) {
    toastErreur(erreur.message);
  } finally {
    chargement.value = false;
  }
}
</script>

<template>
  <form class="grid content-start gap-4" @submit.prevent="soumettre">
    <div class="grid gap-2">
      <p class="mb-1 text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">
        Mission : {{ mission.titre }}
      </p>

      <AuditeurSelect v-model="selection" :auditeurs="auditeurs" />
    </div>

    <DrawerFooter :chargement="chargement" @annuler="emit('fermer')" />
  </form>
</template>
