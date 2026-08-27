<script setup>
import { computed, useId } from 'vue';

// Champ de formulaire complet : libellé, contrôle et message d'erreur.
// Couvre les types utilisés par l'application (texte, email, mot de passe,
// date, nombre, fichier, liste déroulante, zone de texte).
// Pour une liste déroulante, les <option> sont fournies via le slot par défaut.
const props = defineProps({
  label: { type: String, default: '' },
  type: { type: String, default: 'text' },
  erreur: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  autocomplete: { type: String, default: 'off' },
  rows: { type: Number, default: 3 },
  min: { type: [Number, String], default: undefined },
  max: { type: [Number, String], default: undefined },
  accept: { type: String, default: undefined },
  aide: { type: String, default: '' },
  classeSupplementaire: { type: String, default: '' },
});

// Les champs de type fichier ne se lient pas avec v-model : le fichier
// sélectionné est remonté à la page via l'évènement `fichier`.
// `sortie` (blur) sert aux vérifications faites à la sortie du champ.
const emit = defineEmits(['fichier', 'sortie']);

const valeur = defineModel({ default: '' });

const identifiant = useId();

const classesControle = computed(() => [
  'w-full rounded-2xl border bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10',
  props.erreur ? 'border-rose-500' : 'border-slate-200',
  props.type === 'file'
    ? 'file:mr-4 file:rounded-xl file:border-0 file:bg-brand/10 file:px-4 file:py-2 file:text-sm file:font-bold file:text-brand'
    : '',
  props.classeSupplementaire,
]);

function surFichier(evenement) {
  emit('fichier', evenement.target.files[0] ?? null);
}
</script>

<template>
  <div>
    <label
      v-if="label"
      :for="identifiant"
      class="mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500"
    >
      {{ label }}
    </label>

    <select v-if="type === 'select'" :id="identifiant" v-model="valeur" :class="classesControle">
      <slot></slot>
    </select>

    <textarea
      v-else-if="type === 'textarea'"
      :id="identifiant"
      v-model="valeur"
      :rows="rows"
      :placeholder="placeholder"
      :class="classesControle"
    ></textarea>

    <input
      v-else-if="type === 'file'"
      :id="identifiant"
      type="file"
      :accept="accept"
      :class="classesControle"
      @change="surFichier"
    />

    <input
      v-else
      :id="identifiant"
      v-model="valeur"
      :type="type"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :min="min"
      :max="max"
      :class="classesControle"
      @blur="emit('sortie')"
    />

    <p v-if="aide" class="mt-1 text-xs text-slate-400">{{ aide }}</p>

    <p v-if="erreur" class="mt-1 text-xs font-semibold text-rose-500">{{ erreur }}</p>
  </div>
</template>
