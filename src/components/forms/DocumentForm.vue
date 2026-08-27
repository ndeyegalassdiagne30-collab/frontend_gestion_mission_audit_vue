<script setup>
import { reactive, ref } from 'vue';

import FormField from '@/components/ui/FormField.vue';
import DrawerFooter from '@/components/ui/DrawerFooter.vue';

import { useToast } from '@/composables/useToast.js';
import * as documentService from '@/services/documentService.js';
import * as uploadService from '@/services/uploadService.js';

// Extensions autorisées : bureautique et PDF uniquement, ni images ni vidéos.
const EXTENSIONS = [
  '.pdf', '.doc', '.docx', '.xls', '.xlsx',
  '.ppt', '.pptx', '.txt', '.csv', '.odt', '.ods', '.odp',
];

const props = defineProps({
  missions: { type: Array, default: () => [] },
  onSucces: { type: Function, default: null },
});

const emit = defineEmits(['fermer']);

const { succes, erreur: toastErreur } = useToast();

const formulaire = reactive({
  titre: '',
  missionId: '',
  description: '',
});

const fichier = ref(null);
const erreurs = reactive({});
const chargement = ref(false);

function estUnDocument(nomFichier) {
  const nom = nomFichier.toLowerCase();

  return EXTENSIONS.some((extension) => nom.endsWith(extension));
}

function valider() {
  Object.keys(erreurs).forEach((cle) => delete erreurs[cle]);

  if (!formulaire.titre) erreurs.titre = 'Le titre est requis';
  if (!formulaire.missionId) erreurs.missionId = 'La mission est requise';

  if (!fichier.value) {
    erreurs.fichier = 'Un fichier est requis';
  } else if (!estUnDocument(fichier.value.name)) {
    erreurs.fichier = 'Seuls les documents sont acceptés (PDF, Word, Excel, PowerPoint, texte, CSV).';
  }

  return Object.keys(erreurs).length === 0;
}

async function soumettre() {
  if (!valider()) {
    return;
  }

  chargement.value = true;

  try {
    const televerse = await uploadService.envoyerFichier(fichier.value);

    await documentService.creerDocument({
      titre: formulaire.titre,
      nom_fichier: fichier.value.name,
      chemin: televerse.url,
      description: formulaire.description,
      missionId: formulaire.missionId,
      taille: fichier.value.size,
    });

    succes('Document ajouté avec succès.');
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
        placeholder="ex: Bilan comptable 2025"
        :erreur="erreurs.titre"
      />

      <FormField
        v-model="formulaire.missionId"
        class="mb-4"
        label="Mission *"
        type="select"
        :erreur="erreurs.missionId"
      >
        <option value="">Sélectionner une mission</option>
        <option v-for="mission in missions" :key="mission.id" :value="mission.id">
          {{ mission.titre }}
        </option>
      </FormField>

      <FormField
        v-model="formulaire.description"
        class="mb-4"
        label="Description"
        placeholder="ex: Bilan comptable"
      />

      <FormField
        class="mb-2"
        label="Fichier *"
        type="file"
        :accept="EXTENSIONS.join(',')"
        aide="Formats acceptés : PDF, Word, Excel, PowerPoint, texte, CSV."
        :erreur="erreurs.fichier"
        @fichier="fichier = $event"
      />
    </div>

    <DrawerFooter label="Ajouter" :chargement="chargement" @annuler="emit('fermer')" />
  </form>
</template>
