<script setup>
import { computed, onMounted, ref } from 'vue';

import PageHeader from '@/components/ui/PageHeader.vue';
import FilterBar from '@/components/ui/FilterBar.vue';
import AppTable from '@/components/ui/AppTable.vue';

import { useToast } from '@/composables/useToast.js';
import { sameId } from '@/utils/id.js';
import { splitDateHeure } from '@/utils/format.js';

import * as journalService from '@/services/journalService.js';
import * as userService from '@/services/userService.js';

// Page réservée à l'administrateur : journal des actions, filtrable par date
const { erreur: toastErreur } = useToast();

const journaux = ref([]);
const utilisateurs = ref([]);
const filtreDate = ref('');

const COLONNES = [
  { cle: 'utilisateur', label: 'Utilisateur' },
  { cle: 'action', label: 'Action', largeur: '40%' },
  { cle: 'date', label: 'Date', largeur: '15%' },
  { cle: 'heure', label: 'Heure', largeur: '10%' },
];

// Les plus récentes en premier
const journauxTries = computed(
  () => [...journaux.value].sort((a, b) => (a.date_action < b.date_action ? 1 : -1)),
);

const datesDisponibles = computed(() => {
  const dates = new Set(
    journauxTries.value.map((entree) => splitDateHeure(entree.date_action).date),
  );

  return [...dates].map((date) => ({ value: date, label: date }));
});

const journauxFiltres = computed(
  () => (filtreDate.value
    ? journauxTries.value.filter(
      (entree) => splitDateHeure(entree.date_action).date === filtreDate.value,
    )
    : journauxTries.value),
);

function nomUtilisateur(entree) {
  return utilisateurs.value.find(
    (utilisateur) => sameId(utilisateur.id, entree.utilisateurId),
  );
}

async function charger() {
  try {
    [journaux.value, utilisateurs.value] = await Promise.all([
      journalService.listerJournaux(),
      userService.listerUtilisateurs(),
    ]);
  } catch (erreur) {
    toastErreur(erreur.message);
  }
}

onMounted(charger);
</script>

<template>
  <section>
    <PageHeader titre="Journal d'activité" />

    <FilterBar
      v-model="filtreDate"
      placeholder="---Sélectionner par date---"
      :options="datesDisponibles"
    />

    <article>
      <AppTable
        :colonnes="COLONNES"
        :lignes="journauxFiltres"
        message-vide="Aucune activité enregistrée."
      >
        <template #cellule-utilisateur="{ ligne }">
          <strong v-if="nomUtilisateur(ligne)" class="font-bold text-slate-950">
            {{ nomUtilisateur(ligne).prenom }} {{ nomUtilisateur(ligne).nom }}
          </strong>

          <template v-else>Utilisateur inconnu</template>
        </template>

        <template #cellule-date="{ ligne }">
          {{ splitDateHeure(ligne.date_action).date }}
        </template>

        <template #cellule-heure="{ ligne }">
          {{ splitDateHeure(ligne.date_action).heure }}
        </template>
      </AppTable>
    </article>
  </section>
</template>
