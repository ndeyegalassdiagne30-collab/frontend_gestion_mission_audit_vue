<script setup>
import { computed, onMounted, ref } from 'vue';

import PageHeader from '@/components/ui/PageHeader.vue';
import FilterBar from '@/components/ui/FilterBar.vue';
import AppTable from '@/components/ui/AppTable.vue';
import ActionButton from '@/components/ui/ActionButton.vue';
import StatutBadge from '@/components/ui/StatutBadge.vue';
import ProgressBar from '@/components/ui/ProgressBar.vue';
import MissionForm from '@/components/forms/MissionForm.vue';
import AvancementForm from '@/components/forms/AvancementForm.vue';
import MissionDetails from '@/components/details/MissionDetails.vue';

import { useAuthStore } from '@/stores/auth.js';
import { useDrawer } from '@/composables/useDrawer.js';
import { useConfirm } from '@/composables/useConfirm.js';
import { useToast } from '@/composables/useToast.js';
import { sameId } from '@/utils/id.js';
import { escapeHtml } from '@/utils/html.js';
import { aujourdhui } from '@/utils/format.js';

import * as missionService from '@/services/missionService.js';
import * as clientService from '@/services/clientService.js';
import * as userService from '@/services/userService.js';

const auth = useAuthStore();
const { ouvrir } = useDrawer();
const { demanderConfirmation } = useConfirm();
const { succes, erreur: toastErreur } = useToast();

const missions = ref([]);
const clients = ref([]);
const utilisateurs = ref([]);
const filtreStatut = ref('');

const OPTIONS_STATUT = [
  { value: 'en_cours', label: 'En cours' },
  { value: 'en_relecture', label: 'En relecture' },
  { value: 'termine', label: 'Clôturée' },
];

const experts = computed(
  () => utilisateurs.value.filter((utilisateur) => utilisateur.role === 'expert_comptable'),
);

const auditeurs = computed(
  () => utilisateurs.value.filter((utilisateur) => utilisateur.role === 'auditeur'),
);

// L'auditeur ne voit que ses missions, le client que celles de son entreprise
const mesMissions = computed(() => {
  if (auth.estAuditeur) {
    return missions.value.filter(
      (mission) => (mission.auditeurs || []).some((id) => sameId(id, auth.utilisateur?.id)),
    );
  }

  if (auth.estClient) {
    return missions.value.filter(
      (mission) => sameId(mission.clientId, auth.utilisateur?.clientId),
    );
  }

  return missions.value;
});

const missionsFiltrees = computed(
  () => (filtreStatut.value
    ? mesMissions.value.filter((mission) => mission.statut === filtreStatut.value)
    : mesMissions.value),
);

const consultationSeule = computed(() => auth.estAuditeur || auth.estClient);

const COLONNES = computed(() => [
  { cle: 'titre', label: 'Titre' },
  { cle: 'client', label: 'Client', largeur: '12%' },
  { cle: 'expert', label: 'Expert-comptable', largeur: '12%' },
  { cle: 'auditeurs', label: 'Auditeurs', largeur: '13%' },
  { cle: 'periode', label: 'Période', largeur: '13%' },
  { cle: 'avancement', label: 'Avancement', largeur: '12%' },
  { cle: 'statut', label: 'Statut', largeur: '13%' },
  {
    cle: 'actions',
    label: 'Actions',
    largeur: auth.estClient ? '80px' : '160px',
    alignement: 'center',
  },
]);

const messageVide = computed(() => {
  if (auth.estAuditeur) {
    return "Aucune mission ne vous a été affectée.";
  }

  if (auth.estClient) {
    return 'Aucune mission ne concerne votre entreprise pour le moment.';
  }

  return 'Aucune mission enregistrée.';
});

// Une mission non clôturée qui a dépassé sa date de fin prévue
function estEnRetard(mission) {
  return mission.statut !== 'termine' && mission.date_fin_prevue < aujourdhui();
}

function nomClient(mission) {
  return clients.value.find((client) => sameId(client.id, mission.clientId))?.raison_sociale || '-';
}

function nomExpert(mission) {
  const expert = experts.value.find(
    (element) => sameId(element.id, mission.expertComptableId),
  );

  return expert ? `${expert.prenom} ${expert.nom}` : '-';
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

function ouvrirCreation() {
  ouvrir(MissionForm, {
    titre: 'Nouvelle mission',
    icone: 'fa-briefcase',
    props: {
      clients: clients.value,
      experts: experts.value,
      auditeurs: auditeurs.value,
      onSucces: charger,
    },
  });
}

function ouvrirModification(mission) {
  ouvrir(MissionForm, {
    titre: 'Modifier la mission',
    sousTitre: mission.titre,
    icone: 'fa-briefcase',
    props: {
      mission,
      clients: clients.value,
      experts: experts.value,
      auditeurs: auditeurs.value,
      onSucces: charger,
    },
  });
}

function ouvrirDetails(mission) {
  ouvrir(MissionDetails, {
    titre: 'Détails de la mission',
    sousTitre: mission.titre,
    icone: 'fa-eye',
    props: {
      mission,
      clients: clients.value,
      experts: experts.value,
      utilisateurs: utilisateurs.value,
    },
  });
}

function ouvrirAvancement(mission) {
  ouvrir(AvancementForm, {
    titre: "Actualiser l'avancement",
    sousTitre: mission.titre,
    icone: 'fa-gauge-high',
    props: { mission, onSucces: charger },
  });
}

// Réservé à l'expert-comptable : clôture la mission après relecture du rapport
async function confirmerCloture(mission) {
  const confirme = await demanderConfirmation(
    `Confirmez-vous avoir relu le rapport et validez-vous la clôture de la mission "<strong class="text-slate-950">${escapeHtml(mission.titre)}</strong>" ?`,
    {
      titre: 'Valider et clôturer la mission',
      icone: 'fa-stamp',
      iconeClasse: 'bg-emerald-100 text-emerald-600',
      confirmLabel: 'Valider la clôture',
      confirmIcone: 'fa-check',
      confirmClasse: 'bg-emerald-600 shadow-emerald-200 hover:bg-emerald-700',
    },
  );

  if (!confirme) {
    return;
  }

  try {
    await missionService.modifierPartiellement(mission.id, {
      statut: 'termine',
      avancement: 100,
      date_fin_reelle: aujourdhui(),
    });

    succes('Mission clôturée avec succès.');
    await charger();
  } catch (erreur) {
    toastErreur(erreur.message);
  }
}

async function confirmerSuppression(mission) {
  const confirme = await demanderConfirmation('Voulez-vous vraiment supprimer cette mission ?');

  if (!confirme) {
    return;
  }

  try {
    await missionService.supprimerMission(mission.id);
    succes('Mission supprimée.');
    await charger();
  } catch (erreur) {
    toastErreur(erreur.message);
  }
}

onMounted(charger);
</script>

<template>
  <section>
    <PageHeader
      :titre="consultationSeule ? 'Mes missions' : 'Liste des missions'"
      :action-label="consultationSeule ? null : 'Nouvelle mission'"
      @action="ouvrirCreation"
    />

    <FilterBar
      v-model="filtreStatut"
      placeholder="---Sélectionner par statut---"
      :options="OPTIONS_STATUT"
    />

    <article>
      <AppTable :colonnes="COLONNES" :lignes="missionsFiltrees" :message-vide="messageVide">
        <template #cellule-titre="{ ligne }">
          <strong class="font-bold text-slate-950">{{ ligne.titre }}</strong>
        </template>

        <template #cellule-client="{ ligne }">
          {{ nomClient(ligne) }}
        </template>

        <template #cellule-expert="{ ligne }">
          {{ nomExpert(ligne) }}
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

        <template #cellule-periode="{ ligne }">
          <span class="text-xs leading-tight">
            {{ ligne.date_debut }} → {{ ligne.date_fin_prevue }}
          </span>
        </template>

        <template #cellule-avancement="{ ligne }">
          <ProgressBar :avancement="ligne.avancement" />
        </template>

        <template #cellule-statut="{ ligne }">
          <div class="flex flex-col gap-1">
            <StatutBadge :statut="ligne.statut" classe-supplementaire="w-fit" />

            <span
              v-if="estEnRetard(ligne)"
              class="af-badge w-fit rounded-full bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-700"
            >
              En retard
            </span>
          </div>
        </template>

        <template #cellule-actions="{ ligne }">
          <!-- Le client suit l'avancement de ses missions, sans les modifier -->
          <div v-if="auth.estClient" class="flex items-center justify-center">
            <ActionButton
              icone="fa-eye"
              couleur="bg-emerald-100 text-emerald-600"
              titre="Voir l'avancement"
              @click="ouvrirDetails(ligne)"
            />
          </div>

          <div v-else-if="auth.estAuditeur" class="flex items-center justify-center gap-2">
            <ActionButton
              icone="fa-eye"
              couleur="bg-emerald-100 text-emerald-600"
              titre="Voir"
              @click="ouvrirDetails(ligne)"
            />

            <ActionButton
              v-if="ligne.statut !== 'termine'"
              icone="fa-gauge-high"
              couleur="bg-blue-100 text-blue-600"
              titre="Actualiser l'avancement"
              @click="ouvrirAvancement(ligne)"
            />
          </div>

          <div v-else class="flex items-center justify-center gap-2">
            <ActionButton
              icone="fa-eye"
              couleur="bg-emerald-100 text-emerald-600"
              titre="Voir"
              @click="ouvrirDetails(ligne)"
            />

            <ActionButton
              v-if="auth.estExpertComptable && ligne.statut === 'en_relecture'"
              icone="fa-stamp"
              couleur="bg-emerald-100 text-emerald-600"
              titre="Valider et clôturer"
              @click="confirmerCloture(ligne)"
            />

            <ActionButton
              v-if="ligne.statut !== 'termine'"
              icone="fa-pen"
              couleur="bg-amber-100 text-amber-600"
              titre="Modifier"
              @click="ouvrirModification(ligne)"
            />

            <ActionButton
              icone="fa-trash"
              couleur="bg-rose-100 text-rose-600"
              titre="Supprimer"
              @click="confirmerSuppression(ligne)"
            />
          </div>
        </template>
      </AppTable>
    </article>
  </section>
</template>
