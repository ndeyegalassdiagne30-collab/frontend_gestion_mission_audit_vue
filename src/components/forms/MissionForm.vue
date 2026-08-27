<script setup>
import { computed, reactive, ref } from 'vue';

import FormField from '@/components/ui/FormField.vue';
import DrawerFooter from '@/components/ui/DrawerFooter.vue';
import AuditeurSelect from '@/components/ui/AuditeurSelect.vue';

import { useToast } from '@/composables/useToast.js';
import * as missionService from '@/services/missionService.js';

const props = defineProps({
  mission: { type: Object, default: null },
  clients: { type: Array, default: () => [] },
  experts: { type: Array, default: () => [] },
  auditeurs: { type: Array, default: () => [] },
  onSucces: { type: Function, default: null },
});

const emit = defineEmits(['fermer']);

const { succes, erreur: toastErreur } = useToast();

const modeEdition = computed(() => props.mission !== null);

const formulaire = reactive({
  titre: props.mission?.titre || '',
  description: props.mission?.description || '',
  clientId: props.mission?.clientId ?? '',
  expertComptableId: props.mission?.expertComptableId ?? '',
  date_debut: props.mission?.date_debut || '',
  date_fin_prevue: props.mission?.date_fin_prevue || '',
  statut: props.mission?.statut || 'en_cours',
  avancement: props.mission?.avancement ?? 0,
  auditeurs: [...(props.mission?.auditeurs || [])],
});

const erreurs = reactive({});
const chargement = ref(false);

function valider() {
  Object.keys(erreurs).forEach((cle) => delete erreurs[cle]);

  if (!formulaire.titre) erreurs.titre = 'Le titre est requis';
  if (!formulaire.clientId) erreurs.clientId = 'Le client est requis';
  if (!formulaire.expertComptableId) erreurs.expertComptableId = "L'expert-comptable est requis";
  if (!formulaire.date_debut) erreurs.date_debut = 'La date de début est requise';
  if (!formulaire.date_fin_prevue) erreurs.date_fin_prevue = 'La date prévue est requise';

  if (
    formulaire.date_debut
    && formulaire.date_fin_prevue
    && formulaire.date_fin_prevue <= formulaire.date_debut
  ) {
    erreurs.date_fin_prevue = 'La date prévue doit être supérieure à la date de début';
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
      await missionService.modifierMission(props.mission.id, formulaire);
      succes('Mission modifiée avec succès.');
    } else {
      await missionService.creerMission(formulaire);
      succes('Mission créée avec succès.');
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
        v-model="formulaire.titre"
        class="mb-4"
        label="Titre *"
        placeholder="ex: Audit financier 2026"
        :erreur="erreurs.titre"
      />

      <FormField
        v-model="formulaire.description"
        class="mb-4"
        label="Description"
        type="textarea"
        placeholder="ex: Audit des états financiers"
      />

      <FormField
        v-model="formulaire.clientId"
        class="mb-4"
        label="Client *"
        type="select"
        :erreur="erreurs.clientId"
      >
        <option value="">Sélectionner un client</option>
        <option v-for="client in clients" :key="client.id" :value="client.id">
          {{ client.raison_sociale }}
        </option>
      </FormField>

      <FormField
        v-model="formulaire.expertComptableId"
        class="mb-4"
        label="Expert-comptable *"
        type="select"
        :erreur="erreurs.expertComptableId"
      >
        <option value="">Sélectionner un expert-comptable</option>
        <option v-for="expert in experts" :key="expert.id" :value="expert.id">
          {{ expert.prenom }} {{ expert.nom }}
        </option>
      </FormField>

      <div class="mb-4 grid grid-cols-2 gap-3">
        <FormField
          v-model="formulaire.date_debut"
          label="Date début *"
          type="date"
          :erreur="erreurs.date_debut"
        />

        <FormField
          v-model="formulaire.date_fin_prevue"
          label="Date prévue *"
          type="date"
          :erreur="erreurs.date_fin_prevue"
        />
      </div>

      <div class="mb-4 grid grid-cols-2 gap-3">
        <FormField v-model="formulaire.statut" label="Statut" type="select">
          <option value="en_cours">En cours</option>
          <option value="en_relecture">En relecture</option>
        </FormField>

        <FormField
          v-model="formulaire.avancement"
          label="Avancement (%)"
          type="number"
          :min="0"
          :max="100"
        />
      </div>

      <div class="mb-2">
        <p class="mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">
          Auditeurs affectés
        </p>

        <AuditeurSelect v-model="formulaire.auditeurs" :auditeurs="auditeurs" />
      </div>
    </div>

    <DrawerFooter
      :label="modeEdition ? 'Enregistrer' : 'Créer'"
      :chargement="chargement"
      @annuler="emit('fermer')"
    />
  </form>
</template>
