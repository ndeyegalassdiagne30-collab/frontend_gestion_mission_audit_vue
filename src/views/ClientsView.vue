<script setup>
import { computed, onMounted, ref } from 'vue';

import PageHeader from '@/components/ui/PageHeader.vue';
import FilterBar from '@/components/ui/FilterBar.vue';
import AppTable from '@/components/ui/AppTable.vue';
import ActionButton from '@/components/ui/ActionButton.vue';
import ClientForm from '@/components/forms/ClientForm.vue';
import ClientDetails from '@/components/details/ClientDetails.vue';

import { useDrawer } from '@/composables/useDrawer.js';
import { useConfirm } from '@/composables/useConfirm.js';
import { useToast } from '@/composables/useToast.js';

import * as clientService from '@/services/clientService.js';

const { ouvrir } = useDrawer();
const { demanderConfirmation } = useConfirm();
const { succes, erreur: toastErreur } = useToast();

const clients = ref([]);
const filtreStatut = ref('');

const OPTIONS_STATUT = [
  { value: 'actif', label: 'Actif' },
  { value: 'inactif', label: 'Inactif' },
];

const COLONNES = [
  { cle: 'raison_sociale', label: 'Raison sociale' },
  { cle: 'ninea', label: 'NINEA', largeur: '11%' },
  { cle: 'adresse', label: 'Adresse', largeur: '15%' },
  { cle: 'telephone', label: 'Téléphone', largeur: '10%' },
  { cle: 'email', label: 'Email', largeur: '16%' },
  { cle: 'date_creation', label: 'Date création', largeur: '10%' },
  { cle: 'statut', label: 'Statut', largeur: '9%' },
  { cle: 'actions', label: 'Actions', largeur: '112px', alignement: 'center' },
];

const clientsFiltres = computed(
  () => (filtreStatut.value
    ? clients.value.filter((client) => client.statut === filtreStatut.value)
    : clients.value),
);

async function charger() {
  try {
    clients.value = await clientService.listerClients();
  } catch (erreur) {
    toastErreur(erreur.message);
  }
}

function ouvrirCreation() {
  ouvrir(ClientForm, {
    titre: 'Nouveau client',
    icone: 'fa-building',
    props: { onSucces: charger },
  });
}

function ouvrirModification(client) {
  ouvrir(ClientForm, {
    titre: 'Modifier le client',
    sousTitre: client.raison_sociale,
    icone: 'fa-building',
    props: { client, onSucces: charger },
  });
}

function ouvrirDetails(client) {
  ouvrir(ClientDetails, {
    titre: 'Détails du client',
    icone: 'fa-eye',
    props: { client },
  });
}

async function confirmerSuppression(client) {
  const confirme = await demanderConfirmation('Voulez-vous vraiment supprimer ce client ?');

  if (!confirme) {
    return;
  }

  try {
    await clientService.supprimerClient(client.id);
    succes('Client supprimé.');
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
      titre="Liste des clients"
      action-label="Nouveau client"
      @action="ouvrirCreation"
    />

    <FilterBar
      v-model="filtreStatut"
      placeholder="---Sélectionner par statut---"
      :options="OPTIONS_STATUT"
    />

    <article>
      <AppTable
        :colonnes="COLONNES"
        :lignes="clientsFiltres"
        message-vide="Aucun client enregistré."
      >
        <template #cellule-raison_sociale="{ ligne }">
          <strong class="font-bold text-slate-950">{{ ligne.raison_sociale }}</strong>
        </template>

        <template #cellule-statut="{ ligne }">
          <span
            v-if="ligne.statut === 'inactif'"
            class="af-badge rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600"
          >
            Inactif
          </span>

          <span
            v-else
            class="af-badge rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700"
          >
            Actif
          </span>
        </template>

        <template #cellule-actions="{ ligne }">
          <div class="flex items-center justify-center gap-2">
            <ActionButton
              icone="fa-eye"
              couleur="bg-emerald-100 text-emerald-600"
              titre="Voir"
              @click="ouvrirDetails(ligne)"
            />

            <ActionButton
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
