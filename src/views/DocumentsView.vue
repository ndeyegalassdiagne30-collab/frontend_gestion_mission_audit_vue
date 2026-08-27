<script setup>
import { computed, onMounted, ref } from 'vue';

import PageHeader from '@/components/ui/PageHeader.vue';
import FilterBar from '@/components/ui/FilterBar.vue';
import AppTable from '@/components/ui/AppTable.vue';
import ActionButton from '@/components/ui/ActionButton.vue';
import DocumentForm from '@/components/forms/DocumentForm.vue';

import { useAuthStore } from '@/stores/auth.js';
import { useDrawer } from '@/composables/useDrawer.js';
import { useConfirm } from '@/composables/useConfirm.js';
import { useToast } from '@/composables/useToast.js';
import { sameId } from '@/utils/id.js';

import * as documentService from '@/services/documentService.js';
import * as missionService from '@/services/missionService.js';

const auth = useAuthStore();
const { ouvrir } = useDrawer();
const { demanderConfirmation } = useConfirm();
const { succes, erreur: toastErreur } = useToast();

const documents = ref([]);
const missions = ref([]);
const filtreMission = ref('');

const COLONNES = [
  { cle: 'titre', label: 'Titre' },
  { cle: 'mission', label: 'Mission', largeur: '22%' },
  { cle: 'date_upload', label: "Date d'ajout", largeur: '15%' },
  { cle: 'telecharger', label: 'Télécharger', largeur: '128px', alignement: 'center' },
  { cle: 'supprimer', label: 'Supprimer', largeur: '128px', alignement: 'center' },
];

// L'auditeur ne voit que les missions qui lui sont affectées et leurs documents
const mesMissions = computed(() => {
  if (!auth.estAuditeur) {
    return missions.value;
  }

  return missions.value.filter(
    (mission) => (mission.auditeurs || []).some((id) => sameId(id, auth.utilisateur?.id)),
  );
});

const mesDocuments = computed(
  () => documents.value.filter(
    (document) => mesMissions.value.some((mission) => sameId(mission.id, document.missionId)),
  ),
);

const documentsFiltres = computed(
  () => (filtreMission.value
    ? mesDocuments.value.filter((document) => sameId(document.missionId, filtreMission.value))
    : mesDocuments.value),
);

const optionsMissions = computed(
  () => mesMissions.value.map((mission) => ({ value: mission.id, label: mission.titre })),
);

function titreMission(document) {
  return missions.value.find((mission) => sameId(mission.id, document.missionId))?.titre || '-';
}

function estTelechargeable(document) {
  return /^https?:\/\//i.test(document.chemin || '');
}

// Un auditeur ne peut supprimer que les documents qu'il a lui-même déposés
function peutSupprimer(document) {
  return !auth.estAuditeur || sameId(document.utilisateurId, auth.utilisateur?.id);
}

async function charger() {
  try {
    [documents.value, missions.value] = await Promise.all([
      documentService.listerDocuments(),
      missionService.listerMissions(),
    ]);
  } catch (erreur) {
    toastErreur(erreur.message);
  }
}

function ouvrirCreation() {
  ouvrir(DocumentForm, {
    titre: 'Nouveau document',
    icone: 'fa-file-arrow-up',
    props: { missions: mesMissions.value, onSucces: charger },
  });
}

async function confirmerSuppression(document) {
  const confirme = await demanderConfirmation('Voulez-vous vraiment supprimer ce document ?');

  if (!confirme) {
    return;
  }

  try {
    await documentService.supprimerDocument(document.id);
    succes('Document supprimé.');
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
      titre="Liste des documents"
      action-label="Nouveau document"
      @action="ouvrirCreation"
    />

    <FilterBar
      v-model="filtreMission"
      placeholder="---Sélectionner par mission---"
      :options="optionsMissions"
    />

    <article>
      <AppTable
        :colonnes="COLONNES"
        :lignes="documentsFiltres"
        message-vide="Aucun document enregistré."
      >
        <template #cellule-titre="{ ligne }">
          <strong class="font-bold text-slate-950">{{ ligne.titre || ligne.nom_fichier }}</strong>
        </template>

        <template #cellule-mission="{ ligne }">
          {{ titreMission(ligne) }}
        </template>

        <template #cellule-telecharger="{ ligne }">
          <a
            v-if="estTelechargeable(ligne)"
            :href="ligne.chemin"
            target="_blank"
            rel="noopener"
            title="Télécharger"
            class="af-btn-icon inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"
          >
            <i class="fa-solid fa-download text-xs"></i>
          </a>

          <span
            v-else
            title="Fichier indisponible"
            class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-300"
          >
            <i class="fa-solid fa-download text-xs"></i>
          </span>
        </template>

        <template #cellule-supprimer="{ ligne }">
          <ActionButton
            v-if="peutSupprimer(ligne)"
            icone="fa-trash"
            couleur="bg-rose-100 text-rose-600"
            titre="Supprimer"
            @click="confirmerSuppression(ligne)"
          />

          <span v-else class="text-xs text-slate-400">-</span>
        </template>
      </AppTable>
    </article>
  </section>
</template>
