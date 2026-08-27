<script setup>
import { reactive, ref } from 'vue';

import FormField from '@/components/ui/FormField.vue';
import DrawerFooter from '@/components/ui/DrawerFooter.vue';

import { useAuthStore } from '@/stores/auth.js';
import { useToast } from '@/composables/useToast.js';
import { isPhone } from '@/utils/validator.js';
import * as userService from '@/services/userService.js';
import * as uploadService from '@/services/uploadService.js';

const emit = defineEmits(['fermer']);

const auth = useAuthStore();
const { succes, erreur: toastErreur } = useToast();

const utilisateur = auth.utilisateur;

const formulaire = reactive({
  nom: utilisateur?.nom || '',
  prenom: utilisateur?.prenom || '',
  email: utilisateur?.email || '',
  telephone: utilisateur?.telephone || '',
  mot_de_passe: '',
  ancien_mot_de_passe: '',
});

const photo = ref(null);
const erreurs = reactive({});
const chargement = ref(false);

function valider() {
  Object.keys(erreurs).forEach((cle) => delete erreurs[cle]);

  if (!formulaire.nom) erreurs.nom = 'Le nom est requis';
  if (!formulaire.prenom) erreurs.prenom = 'Le prénom est requis';
  if (!formulaire.email) erreurs.email = "L'email est requis";

  if (!formulaire.telephone) {
    erreurs.telephone = 'Le téléphone est requis';
  } else if (!isPhone(formulaire.telephone)) {
    erreurs.telephone = 'Le téléphone doit contenir 9 chiffres';
  }

  if (formulaire.mot_de_passe && !formulaire.ancien_mot_de_passe) {
    erreurs.ancien_mot_de_passe = 'Le mot de passe actuel est requis';
  }

  return Object.keys(erreurs).length === 0;
}

async function soumettre() {
  if (!valider()) {
    return;
  }

  chargement.value = true;

  try {
    const donnees = {
      ...formulaire,
      role: utilisateur.role,
      photo: utilisateur.photo || '',
    };

    if (photo.value) {
      const televerse = await uploadService.envoyerFichier(photo.value);
      donnees.photo = televerse.url;
    }

    // Le contrôle d'unicité côté front est inutile ici : un auditeur ou un
    // client ne reçoit qu'un annuaire réduit. L'API répond elle-même en 409.
    const misAJour = await userService.modifierUtilisateur(utilisateur.id, donnees, {
      controlerUnicite: false,
    });

    auth.majUtilisateur({ ...utilisateur, ...misAJour });
    succes('Profil mis à jour avec succès.');
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
      <div class="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField v-model="formulaire.nom" label="Nom *" :erreur="erreurs.nom" />
        <FormField v-model="formulaire.prenom" label="Prénom *" :erreur="erreurs.prenom" />
      </div>

      <FormField
        v-model="formulaire.email"
        class="mb-4"
        label="Email *"
        type="email"
        :erreur="erreurs.email"
      />

      <FormField
        v-model="formulaire.telephone"
        class="mb-4"
        label="Téléphone *"
        :erreur="erreurs.telephone"
      />

      <FormField
        class="mb-4"
        label="Photo de profil"
        type="file"
        accept="image/*"
        @fichier="photo = $event"
      />

      <FormField
        v-model="formulaire.mot_de_passe"
        class="mb-4"
        label="Nouveau mot de passe (laisser vide pour ne pas changer)"
        type="password"
        placeholder="••••••••"
        autocomplete="new-password"
      />

      <FormField
        v-model="formulaire.ancien_mot_de_passe"
        class="mb-2"
        label="Mot de passe actuel (obligatoire pour changer de mot de passe)"
        type="password"
        placeholder="••••••••"
        autocomplete="current-password"
        :erreur="erreurs.ancien_mot_de_passe"
      />
    </div>

    <DrawerFooter :chargement="chargement" @annuler="emit('fermer')" />
  </form>
</template>
