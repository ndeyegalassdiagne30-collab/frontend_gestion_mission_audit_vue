<script setup>
import { computed, reactive, ref } from 'vue';

import FormField from '@/components/ui/FormField.vue';
import DrawerFooter from '@/components/ui/DrawerFooter.vue';
import SlideToConfirm from '@/components/ui/SlideToConfirm.vue';

import { useToast } from '@/composables/useToast.js';
import { isPhone } from '@/utils/validator.js';
import { aujourdhui } from '@/utils/format.js';
import * as clientService from '@/services/clientService.js';
import * as userService from '@/services/userService.js';

const props = defineProps({
  client: { type: Object, default: null },
  onSucces: { type: Function, default: null },
});

const emit = defineEmits(['fermer']);

const { succes, erreur: toastErreur } = useToast();

const modeEdition = computed(() => props.client !== null);

const formulaire = reactive({
  raison_sociale: props.client?.raison_sociale || '',
  ninea: props.client?.ninea || '',
  adresse: props.client?.adresse || '',
  telephone: props.client?.telephone || '',
  email: props.client?.email || '',
  date_creation: props.client?.date_creation || aujourdhui(),
  statut: props.client?.statut || 'actif',
  mot_de_passe: '',
  mot_de_passe_confirm: '',
});

// À la création seulement : « glisser » ouvre les champs du compte d'accès
const avecCompte = ref(false);
const confirmationTouchee = ref(false);
const erreurs = reactive({});
const chargement = ref(false);

// Classes littérales (scannées par Tailwind) pour l'apparition animée des
// champs du compte client : la hauteur est animée via grid-template-rows.
const ENVELOPPE_MASQUEE = 'grid overflow-hidden transition-[grid-template-rows] duration-500 ease-out [grid-template-rows:0fr]';
const ENVELOPPE_VISIBLE = 'grid overflow-hidden transition-[grid-template-rows] duration-500 ease-out [grid-template-rows:1fr]';
const CHAMPS_MASQUES = 'grid grid-cols-1 gap-4 pt-4 opacity-0 -translate-y-1 transition-all duration-500 sm:grid-cols-2';
const CHAMPS_VISIBLES = 'grid grid-cols-1 gap-4 pt-4 opacity-100 translate-y-0 transition-all duration-500 sm:grid-cols-2';

// L'erreur de confirmation ne s'affiche qu'après une première sortie du champ,
// pour ne pas alarmer l'utilisateur dès la première frappe.
const erreurConfirmationDirecte = computed(() => {
  if (!confirmationTouchee.value || !formulaire.mot_de_passe_confirm) {
    return '';
  }

  return formulaire.mot_de_passe === formulaire.mot_de_passe_confirm
    ? ''
    : 'Les mots de passe ne correspondent pas';
});

function viderErreurs() {
  Object.keys(erreurs).forEach((cle) => delete erreurs[cle]);
}

// L'email n'est requis qu'en modification : à la création, il n'est demandé
// que si l'option « compte client » est activée.
function valider() {
  viderErreurs();

  if (!formulaire.raison_sociale) erreurs.raison_sociale = 'La raison sociale est requise';
  if (!formulaire.ninea) erreurs.ninea = 'Le NINEA est requis';
  if (!formulaire.adresse) erreurs.adresse = "L'adresse est requise";

  if (!formulaire.telephone) {
    erreurs.telephone = 'Le téléphone est requis';
  } else if (!isPhone(formulaire.telephone)) {
    erreurs.telephone = 'Le téléphone doit contenir 9 chiffres';
  }

  if (modeEdition.value && !formulaire.email) erreurs.email = "L'email est requis";
  if (!formulaire.date_creation) erreurs.date_creation = 'La date de création est requise';

  if (!modeEdition.value && avecCompte.value) {
    if (!formulaire.email) {
      erreurs.email = "L'email est requis pour créer un compte";
    }

    if (!formulaire.mot_de_passe) {
      erreurs.mot_de_passe = 'Le mot de passe est requis';
    } else if (formulaire.mot_de_passe.length < 6) {
      erreurs.mot_de_passe = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    if (!formulaire.mot_de_passe_confirm) {
      erreurs.mot_de_passe_confirm = 'La confirmation est requise';
    } else if (formulaire.mot_de_passe_confirm !== formulaire.mot_de_passe) {
      erreurs.mot_de_passe_confirm = 'Les mots de passe ne correspondent pas';
    }
  }

  return Object.keys(erreurs).length === 0;
}

async function soumettre() {
  if (!valider()) {
    return;
  }

  chargement.value = true;

  try {
    if (modeEdition.value) {
      await clientService.modifierClient(props.client.id, formulaire);
      succes('Client modifié avec succès.');
    } else {
      const clientCree = await clientService.creerClient(formulaire);

      if (avecCompte.value) {
        // Le client existe déjà : si la création du compte échoue, on le
        // signale sans annuler l'enregistrement du client.
        try {
          await userService.creerUtilisateur({
            nom: 'Client',
            prenom: formulaire.raison_sociale,
            email: formulaire.email,
            telephone: formulaire.telephone,
            mot_de_passe: formulaire.mot_de_passe,
            role: 'client',
            clientId: clientCree.id,
          });

          succes("Client créé avec un compte d'accès.");
        } catch (erreurCompte) {
          toastErreur(`Client créé, mais le compte n'a pas pu être créé : ${erreurCompte.message}`);
        }
      } else {
        succes('Client créé avec succès.');
      }
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
      <FormField
        v-model="formulaire.raison_sociale"
        class="mb-4"
        label="Raison sociale *"
        placeholder="ex: SENTECH SARL"
        :erreur="erreurs.raison_sociale"
      />

      <FormField
        v-model="formulaire.ninea"
        class="mb-4"
        label="NINEA *"
        placeholder="ex: SN123456789"
        :erreur="erreurs.ninea"
      />

      <FormField
        v-model="formulaire.adresse"
        class="mb-4"
        label="Adresse *"
        placeholder="ex: Dakar, Sénégal"
        :erreur="erreurs.adresse"
      />

      <FormField
        v-model="formulaire.telephone"
        class="mb-4"
        label="Téléphone *"
        placeholder="ex: 771234567"
        :erreur="erreurs.telephone"
      />

      <FormField
        v-if="modeEdition"
        v-model="formulaire.email"
        class="mb-4"
        label="Email *"
        type="email"
        placeholder="ex: contact@client.sn"
        :erreur="erreurs.email"
      />

      <FormField
        v-model="formulaire.date_creation"
        class="mb-4"
        label="Date de création *"
        type="date"
        :erreur="erreurs.date_creation"
      />

      <FormField v-model="formulaire.statut" class="mb-2" label="Statut" type="select">
        <option value="actif">Actif</option>
        <option value="inactif">Inactif</option>
      </FormField>

      <div v-if="!modeEdition" class="mt-4 border-t border-slate-100 pt-4">
        <p class="mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">
          Accès client
        </p>

        <SlideToConfirm
          v-model="avecCompte"
          label="Glisser pour créer un client avec un compte"
          label-confirme="Client avec compte"
          label-reinitialiser="Retirer le compte"
        />

        <div :class="avecCompte ? ENVELOPPE_VISIBLE : ENVELOPPE_MASQUEE">
          <div class="min-h-0 overflow-hidden">
            <div :class="avecCompte ? CHAMPS_VISIBLES : CHAMPS_MASQUES">
              <FormField
                v-model="formulaire.email"
                class="sm:col-span-2"
                label="Email *"
                type="email"
                placeholder="ex: contact@client.sn"
                :erreur="erreurs.email"
              />

              <FormField
                v-model="formulaire.mot_de_passe"
                label="Mot de passe *"
                type="password"
                placeholder="••••••••"
                autocomplete="new-password"
                :erreur="erreurs.mot_de_passe"
              />

              <FormField
                v-model="formulaire.mot_de_passe_confirm"
                label="Confirmation *"
                type="password"
                placeholder="••••••••"
                autocomplete="new-password"
                :erreur="erreurs.mot_de_passe_confirm || erreurConfirmationDirecte"
                @sortie="confirmationTouchee = true"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <DrawerFooter
      :label="modeEdition ? 'Enregistrer' : 'Créer'"
      :chargement="chargement"
      @annuler="emit('fermer')"
    />
  </form>
</template>
