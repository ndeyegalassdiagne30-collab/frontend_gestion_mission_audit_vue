<script setup>
import { computed, onMounted, ref } from 'vue';

import PageHeader from '@/components/ui/PageHeader.vue';
import FilterBar from '@/components/ui/FilterBar.vue';
import AppTable from '@/components/ui/AppTable.vue';
import ActionButton from '@/components/ui/ActionButton.vue';
import UserAvatar from '@/components/ui/UserAvatar.vue';
import UserForm from '@/components/forms/UserForm.vue';

import { useAuthStore } from '@/stores/auth.js';
import { useDrawer } from '@/composables/useDrawer.js';
import { useConfirm } from '@/composables/useConfirm.js';
import { useToast } from '@/composables/useToast.js';
import { sameId } from '@/utils/id.js';
import { ROLE_LABELS } from '@/utils/statuts.js';

import * as userService from '@/services/userService.js';

const auth = useAuthStore();
const { ouvrir } = useDrawer();
const { demanderConfirmation } = useConfirm();
const { succes, erreur: toastErreur } = useToast();

const utilisateurs = ref([]);
const filtreRole = ref('');

const OPTIONS_ROLE = [
  { value: 'administrateur', label: 'Administrateur' },
  { value: 'expert_comptable', label: 'Expert-comptable' },
  { value: 'auditeur', label: 'Auditeur' },
];

const COLONNES = [
  { cle: 'photo', label: 'Photo', largeur: '72px', alignement: 'center' },
  { cle: 'nom', label: 'Nom', largeur: '14%' },
  { cle: 'prenom', label: 'Prénom', largeur: '14%' },
  { cle: 'role', label: 'Rôle', largeur: '15%' },
  { cle: 'telephone', label: 'Téléphone', largeur: '13%' },
  { cle: 'email', label: 'Email' },
  { cle: 'actions', label: 'Actions', largeur: '88px', alignement: 'center' },
];

const utilisateursFiltres = computed(
  () => (filtreRole.value
    ? utilisateurs.value.filter((utilisateur) => utilisateur.role === filtreRole.value)
    : utilisateurs.value),
);

// On ne se supprime ni ne se modifie soi-même depuis cette page
function estMoi(utilisateur) {
  return sameId(utilisateur.id, auth.utilisateur?.id);
}

async function charger() {
  try {
    utilisateurs.value = await userService.listerUtilisateurs();
  } catch (erreur) {
    toastErreur(erreur.message);
  }
}

function ouvrirCreation() {
  ouvrir(UserForm, {
    titre: 'Nouvel utilisateur',
    icone: 'fa-user',
    props: { onSucces: charger },
  });
}

function ouvrirModification(utilisateur) {
  ouvrir(UserForm, {
    titre: "Modifier l'utilisateur",
    sousTitre: `${utilisateur.prenom} ${utilisateur.nom}`,
    icone: 'fa-user',
    props: { utilisateur, onSucces: charger },
  });
}

async function confirmerSuppression(utilisateur) {
  const confirme = await demanderConfirmation('Voulez-vous vraiment supprimer cet utilisateur ?');

  if (!confirme) {
    return;
  }

  try {
    await userService.supprimerUtilisateur(utilisateur.id);
    succes('Utilisateur supprimé.');
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
      titre="Liste des utilisateurs"
      action-label="Nouvel utilisateur"
      @action="ouvrirCreation"
    />

    <FilterBar
      v-model="filtreRole"
      placeholder="---Sélectionner par rôle---"
      :options="OPTIONS_ROLE"
    />

    <article>
      <AppTable
        :colonnes="COLONNES"
        :lignes="utilisateursFiltres"
        message-vide="Aucun utilisateur enregistré."
      >
        <template #cellule-photo="{ ligne }">
          <UserAvatar :utilisateur="ligne" taille="mx-auto h-10 w-10" />
        </template>

        <template #cellule-nom="{ ligne }">
          <strong class="font-bold text-slate-950">{{ ligne.nom }}</strong>
        </template>

        <template #cellule-role="{ ligne }">
          <span
            class="af-badge rounded-full bg-brand/10 px-2.5 py-1 text-xs font-bold text-brand"
          >
            {{ ROLE_LABELS[ligne.role] || ligne.role }}
          </span>
        </template>

        <template #cellule-actions="{ ligne }">
          <span v-if="estMoi(ligne)" class="text-xs text-slate-400">-</span>

          <div v-else class="flex items-center justify-center gap-2">
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
