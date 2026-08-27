<script setup>
import { computed, onMounted, ref } from 'vue';

import PageHeader from '@/components/ui/PageHeader.vue';
import AppTable from '@/components/ui/AppTable.vue';
import ActionButton from '@/components/ui/ActionButton.vue';
import AffectationForm from '@/components/forms/AffectationForm.vue';

import { useDrawer } from '@/composables/useDrawer.js';
import { useToast } from '@/composables/useToast.js';
import { sameId } from '@/utils/id.js';

import * as missionService from '@/services/missionService.js';
import * as clientService from '@/services/clientService.js';
import * as userService from '@/services/userService.js';

const { ouvrir } = useDrawer();
const { erreur: toastErreur } = useToast();

const missions = ref([]);
const clients = ref([]);
const utilisateurs = ref([]);

const COLONNES = [
  { cle: 'titre', label: 'Titre' },
  { cle: 'client', label: 'Client', largeur: '22%' },
  { cle: 'auditeurs', label: 'Auditeurs affectés', largeur: '30%' },
  { cle: 'actions', label: 'Actions', largeur: '90px', alignement: 'center' },
];

const auditeurs = computed(
  () => utilisateurs.value.filter((utilisateur) => utilisateur.role === 'auditeur'),
);

function nomClient(mission) {
  return clients.value.find((client) => sameId(client.id, mission.clientId))?.raison_sociale || '-';
}

function auditeursDe(mission) {
  return utilisateurs.value.filter(
    (utilisateur) => (mission.auditeurs || []).some((id) => sameId(id, utilisateur.id)),
  );
}

async function charger() {
  try {
    [missions.value, clients.value, utilisateurs.value] = await Promise.all([
      missionService.listerMissions(),
      clientService.listerClients(),
      userService.listerUtilisateurs(),
    ]);
  } catch (erreur) {
    toastErreur(erreur.message);
  }
}

function ouvrirAffectation(mission) {
  ouvrir(AffectationForm, {
    titre: 'Gérer les auditeurs affectés',
    sousTitre: mission.titre,
    icone: 'fa-user-check',
    props: { mission, auditeurs: auditeurs.value, onSucces: charger },
  });
}

onMounted(charger);
</script>

<template>
  <section>
    <PageHeader titre="Liste des affectations d'audit" />

    <article>
      <AppTable
        :colonnes="COLONNES"
        :lignes="missions"
        message-vide="Aucune mission enregistrée."
      >
        <template #cellule-titre="{ ligne }">
          <strong class="font-bold text-slate-950">{{ ligne.titre }}</strong>
        </template>

        <template #cellule-client="{ ligne }">
          {{ nomClient(ligne) }}
        </template>

        <template #cellule-auditeurs="{ ligne }">
          <span v-if="auditeursDe(ligne).length === 0" class="text-xs text-slate-400">Aucun</span>

          <div v-else class="flex flex-wrap gap-1">
            <span
              v-for="auditeur in auditeursDe(ligne)"
              :key="auditeur.id"
              class="af-badge rounded-full bg-brand/10 px-2 py-0.5 text-xs font-semibold text-brand"
            >
              {{ auditeur.prenom }}
            </span>
          </div>
        </template>

        <template #cellule-actions="{ ligne }">
          <ActionButton
            icone="fa-user-check"
            couleur="bg-brand/10 text-brand"
            titre="Gérer les auditeurs"
            @click="ouvrirAffectation(ligne)"
          />
        </template>
      </AppTable>
    </article>
  </section>
</template>
