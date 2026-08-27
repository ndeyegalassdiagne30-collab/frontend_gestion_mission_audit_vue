<script setup>
import { computed, reactive, ref } from 'vue';

import FormField from '@/components/ui/FormField.vue';
import DrawerFooter from '@/components/ui/DrawerFooter.vue';

import { useToast } from '@/composables/useToast.js';
import { isPhone } from '@/utils/validator.js';
import * as userService from '@/services/userService.js';
import * as uploadService from '@/services/uploadService.js';

const props = defineProps({
  utilisateur: { type: Object, default: null },
  onSucces: { type: Function, default: null },
});

const emit = defineEmits(['fermer']);

const { succes, erreur: toastErreur } = useToast();

const modeEdition = computed(() => props.utilisateur !== null);

const formulaire = reactive({
  nom: props.utilisateur?.nom || '',
  prenom: props.utilisateur?.prenom || '',
  email: props.utilisateur?.email || '',
  mot_de_passe: '',
  mot_de_passe_confirm: '',
  telephone: props.utilisateur?.telephone || '',
  role: props.utilisateur?.role || 'auditeur',
});

const photo = ref(null);
const confirmationTouchee = ref(false);
const erreurs = reactive({});
const chargement = ref(false);

// L'erreur ne s'affiche qu'après une première sortie du champ Confirmation,
// pour ne pas alarmer l'utilisateur dès la première frappe.
const erreurConfirmationDirecte = computed(() => {
  if (!confirmationTouchee.value || !formulaire.mot_de_passe_confirm) {
    return '';
  }

  return formulaire.mot_de_passe === formulaire.mot_de_passe_confirm
    ? ''
    : 'Les mots de passe ne correspondent pas';
});

function valider() {
  Object.keys(erreurs).forEach((cle) => delete erreurs[cle]);

  if (!formulaire.nom) erreurs.nom = 'Le nom est requis';
  if (!formulaire.prenom) erreurs.prenom = 'Le prénom est requis';
  if (!formulaire.email) erreurs.email = "L'email est requis";

  if (!modeEdition.value && !formulaire.mot_de_passe) {
    erreurs.mot_de_passe = 'Le mot de passe est requis';
  }

  if (formulaire.mot_de_passe && formulaire.mot_de_passe !== formulaire.mot_de_passe_confirm) {
    erreurs.mot_de_passe_confirm = 'Les mots de passe ne correspondent pas';
  }

  if (!formulaire.telephone) {
    erreurs.telephone = 'Le téléphone est requis';
  } else if (!isPhone(formulaire.telephone)) {
    erreurs.telephone = 'Le téléphone doit contenir 9 chiffres';
  }

  return Object.keys(erreurs).length === 0;
}

async function soumettre() {
  if (!valider()) {
    return;
  }

  chargement.value = true;

  try {
    const donnees = { ...formulaire, photo: props.utilisateur?.photo || '' };

    if (photo.value) {
      const televerse = await uploadService.envoyerFichier(photo.value);
      donnees.photo = televerse.url;
    }

    if (modeEdition.value) {
      await userService.modifierUtilisateur(props.utilisateur.id, donnees);
      succes('Utilisateur modifié avec succès.');
    } else {
      await userService.creerUtilisateur(donnees);
      succes('Utilisateur créé avec succès.');
    }

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
      <div class="mb-4 grid grid-cols-2 gap-3">
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

      <div class="mb-4 grid grid-cols-2 gap-3">
        <FormField
          v-model="formulaire.mot_de_passe"
          :label="`Mot de passe ${modeEdition ? '' : '*'}`"
          type="password"
          placeholder="••••••••"
          autocomplete="new-password"
          :erreur="erreurs.mot_de_passe"
        />

        <FormField
          v-model="formulaire.mot_de_passe_confirm"
          :label="`Confirmation ${modeEdition ? '' : '*'}`"
          type="password"
          placeholder="••••••••"
          autocomplete="new-password"
          :erreur="erreurs.mot_de_passe_confirm || erreurConfirmationDirecte"
          @sortie="confirmationTouchee = true"
        />
      </div>

      <FormField
        v-model="formulaire.telephone"
        class="mb-4"
        label="Téléphone *"
        :erreur="erreurs.telephone"
      />

      <FormField v-model="formulaire.role" class="mb-4" label="Rôle *" type="select">
        <option value="administrateur">Administrateur</option>
        <option value="expert_comptable">Expert-comptable</option>
        <option value="auditeur">Auditeur</option>
      </FormField>

      <FormField
        class="mb-2"
        label="Photo (optionnel)"
        type="file"
        accept="image/*"
        @fichier="photo = $event"
      />
    </div>

    <DrawerFooter
      :label="modeEdition ? 'Enregistrer' : 'Créer'"
      :chargement="chargement"
      @annuler="emit('fermer')"
    />
  </form>
</template>
