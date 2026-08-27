<script setup>
import { reactive, ref } from 'vue';

import FormField from '@/components/ui/FormField.vue';
import DrawerFooter from '@/components/ui/DrawerFooter.vue';

import { useToast } from '@/composables/useToast.js';
import * as missionService from '@/services/missionService.js';

// Réservé aux auditeurs : ne permet de modifier que l'avancement et le statut
// des missions qui leur sont affectées.
const props = defineProps({
  mission: { type: Object, required: true },
  onSucces: { type: Function, default: null },
});

const emit = defineEmits(['fermer']);

const { succes, erreur: toastErreur } = useToast();

const formulaire = reactive({
  avancement: props.mission.avancement ?? 0,
  statut: props.mission.statut,
});

const chargement = ref(false);

async function soumettre() {
  chargement.value = true;

  try {
    await missionService.modifierPartiellement(props.mission.id, {
      avancement: Number(formulaire.avancement) || 0,
      statut: formulaire.statut,
    });

    succes('Avancement mis à jour avec succès.');
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
    <div>
      <p class="mb-1 text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">Mission</p>
      <p class="mb-4 text-sm font-bold text-slate-950">{{ mission.titre }}</p>

      <FormField
        v-model="formulaire.avancement"
        class="mb-4"
        label="Avancement (%)"
        type="number"
        :min="0"
        :max="100"
        classe-supplementaire="af-input"
      />

      <FormField
        v-model="formulaire.statut"
        class="mb-2"
        label="Statut"
        type="select"
        classe-supplementaire="af-input"
      >
        <option value="en_cours">En cours</option>
        <option value="en_relecture">En relecture</option>
      </FormField>
    </div>

    <DrawerFooter :chargement="chargement" @annuler="emit('fermer')" />
  </form>
</template>
