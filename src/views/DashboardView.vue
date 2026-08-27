<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import PageHeader from '@/components/ui/PageHeader.vue';
import AppTable from '@/components/ui/AppTable.vue';
import StatCard from '@/components/ui/StatCard.vue';
import StatutBadge from '@/components/ui/StatutBadge.vue';
import ProgressBar from '@/components/ui/ProgressBar.vue';

import { useAuthStore } from '@/stores/auth.js';
import { useToast } from '@/composables/useToast.js';
import { sameId } from '@/utils/id.js';

import * as missionService from '@/services/missionService.js';
import * as clientService from '@/services/clientService.js';
import * as documentService from '@/services/documentService.js';
import * as userService from '@/services/userService.js';
import * as journalService from '@/services/journalService.js';

const router = useRouter();
const auth = useAuthStore();
const { erreur: toastErreur } = useToast();

const missions = ref([]);
const documents = ref([]);
const clients = ref([]);
const utilisateurs = ref([]);
const journaux = ref([]);
const chargement = ref(true);

const COLONNES = [
  { cle: 'titre', label: 'Titre' },
  { cle: 'client', label: 'Client', largeur: '20%' },
  { cle: 'auditeurs', label: 'Auditeurs', largeur: '18%' },
  { cle: 'echeance', label: 'Échéance', largeur: '14%' },
  { cle: 'avancement', label: 'Avancement', largeur: '17%' },
  { cle: 'statut', label: 'Statut', largeur: '16%' },
];

// Missions affectées à l'auditeur connecté
const mesMissions = computed(
  () => missions.value.filter(
    (mission) => (mission.auditeurs || []).some((id) => sameId(id, auth.utilisateur?.id)),
  ),
);

const mesDocuments = computed(
  () => documents.value.filter(
    (document) => mesMissions.value.some((mission) => sameId(mission.id, document.missionId)),
  ),
);

const missionsAffichees = computed(() => (auth.estAuditeur ? mesMissions.value : missions.value));

const missionsTitre = computed(
  () => (auth.estAuditeur ? 'Mes missions à venir' : 'Aperçu des missions'),
);

const missionsVide = computed(
  () => (auth.estAuditeur ? "Aucune mission ne vous a été affectée." : 'Aucune mission enregistrée.'),
);

// Les 5 missions les plus proches de leur échéance
const apercuMissions = computed(
  () => [...missionsAffichees.value]
    .sort((a, b) => (a.date_fin_prevue > b.date_fin_prevue ? 1 : -1))
    .slice(0, 5),
);

const cartes = computed(() => {
  if (auth.estAuditeur) {
    return [
      {
        icone: 'fa-briefcase',
        iconeClasse: 'bg-blue-100 text-blue-600',
        valeur: mesMissions.value.length,
        label: 'Missions affectées',
        couleur: '#2563eb',
      },
      {
        icone: 'fa-check',
        iconeClasse: 'bg-emerald-100 text-emerald-600',
        valeur: mesMissions.value.filter((mission) => mission.statut === 'termine').length,
        label: 'Missions clôturées',
        couleur: '#059669',
      },
      {
        icone: 'fa-file-lines',
        iconeClasse: 'bg-amber-100 text-amber-600',
        valeur: mesDocuments.value.length,
        label: 'Documents',
        couleur: '#d97706',
      },
    ];
  }

  return [
    {
      icone: 'fa-users',
      iconeClasse: 'bg-emerald-100 text-emerald-600',
      valeur: clients.value.filter((client) => client.statut === 'actif').length,
      label: 'Clients actifs',
      couleur: '#059669',
    },
    {
      icone: 'fa-briefcase',
      iconeClasse: 'bg-blue-100 text-blue-600',
      valeur: missions.value.length,
      label: 'Missions',
      couleur: '#2563eb',
    },
    {
      icone: 'fa-file-lines',
      iconeClasse: 'bg-amber-100 text-amber-600',
      valeur: documents.value.length,
      label: 'Documents',
      couleur: '#d97706',
    },
  ];
});

// Les 5 dernières entrées du journal (bloc réservé à l'administrateur)
const activitesRecentes = computed(
  () => [...journaux.value]
    .sort((a, b) => (a.date_action < b.date_action ? 1 : -1))
    .slice(0, 5),
);

function nomClient(mission) {
  return clients.value.find((client) => sameId(client.id, mission.clientId))?.raison_sociale || '-';
}

function prenomsAuditeurs(mission) {
  const affectes = utilisateurs.value.filter(
    (utilisateur) => (mission.auditeurs || []).some((id) => sameId(id, utilisateur.id)),
  );

  return affectes.length ? affectes.map((auditeur) => auditeur.prenom).join(', ') : '-';
}

function nomAuteur(entree) {
  const auteur = utilisateurs.value.find(
    (utilisateur) => sameId(utilisateur.id, entree.utilisateurId),
  );

  return auteur ? `${auteur.prenom} ${auteur.nom}` : 'Utilisateur inconnu';
}

async function charger() {
  chargement.value = true;

  try {
    [missions.value, documents.value, clients.value, utilisateurs.value] = await Promise.all([
      missionService.listerMissions(),
      documentService.listerDocuments(),
      clientService.listerClients(),
      userService.listerUtilisateurs(),
    ]);

    if (auth.estAdmin) {
      journaux.value = await journalService.listerJournaux();
    }
  } catch (erreur) {
    toastErreur(erreur.message);
  } finally {
    chargement.value = false;
  }
}

onMounted(charger);
</script>

<template>
  <section>
    <PageHeader titre="Tableau de bord" />

    <div
      v-if="chargement"
      class="grid min-h-[50vh] place-items-center rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-sm"
    >
      <div>
        <div
          class="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-brand"
        ></div>
        <p class="mt-4 text-sm font-bold text-slate-500">Chargement...</p>
      </div>
    </div>

    <template v-else>
      <div class="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <StatCard
          v-for="carte in cartes"
          :key="carte.label"
          :icone="carte.icone"
          :icone-classe="carte.iconeClasse"
          :valeur="carte.valeur"
          :label="carte.label"
          :couleur="carte.couleur"
        />
      </div>

      <div class="grid grid-cols-1 gap-6" :class="{ 'lg:grid-cols-3': auth.estAdmin }">
        <article
          class="af-card rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
          :class="{ 'lg:col-span-2': auth.estAdmin }"
        >
          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-xl font-black text-slate-950">{{ missionsTitre }}</h2>

            <button
              type="button"
              @click="router.push({ name: 'missions' })"
              class="text-sm font-bold text-brand transition hover:underline"
            >
              Voir tout →
            </button>
          </div>

          <AppTable
            :colonnes="COLONNES"
            :lignes="apercuMissions"
            :message-vide="missionsVide"
          >
            <template #cellule-titre="{ ligne }">
              <strong class="font-bold text-slate-950">{{ ligne.titre }}</strong>
            </template>

            <template #cellule-client="{ ligne }">
              {{ nomClient(ligne) }}
            </template>

            <template #cellule-auditeurs="{ ligne }">
              {{ prenomsAuditeurs(ligne) }}
            </template>

            <template #cellule-echeance="{ ligne }">
              {{ ligne.date_fin_prevue }}
            </template>

            <template #cellule-avancement="{ ligne }">
              <ProgressBar :avancement="ligne.avancement" largeur="w-10" />
            </template>

            <template #cellule-statut="{ ligne }">
              <StatutBadge :statut="ligne.statut" />
            </template>
          </AppTable>
        </article>

        <article
          v-if="auth.estAdmin"
          class="af-card rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 class="mb-2 text-xl font-black text-slate-950">Activités récentes</h2>

          <ul class="divide-y divide-slate-100">
            <li
              v-for="entree in activitesRecentes"
              :key="entree.id"
              class="flex items-start justify-between gap-3 border-t border-slate-100 py-3 transition first:border-t-0 hover:bg-slate-50/70"
            >
              <div class="flex min-w-0 flex-1 items-start gap-3">
                <div
                  class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand"
                >
                  <i class="fa-solid fa-clock-rotate-left text-xs"></i>
                </div>

                <div class="min-w-0">
                  <p class="break-words text-sm font-bold text-slate-950">{{ entree.action }}</p>
                  <p class="text-xs text-slate-500">{{ nomAuteur(entree) }}</p>
                </div>
              </div>

              <span class="shrink-0 whitespace-nowrap text-xs font-semibold text-slate-400">
                {{ entree.date_action }}
              </span>
            </li>

            <li
              v-if="activitesRecentes.length === 0"
              class="py-6 text-center text-sm text-slate-500"
            >
              Aucune activité récente.
            </li>
          </ul>
        </article>
      </div>
    </template>
  </section>
</template>
