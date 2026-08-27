import { ref } from 'vue';

// Options par défaut : la boîte sert avant tout aux suppressions.
const OPTIONS_PAR_DEFAUT = {
  titre: 'Confirmation',
  icone: 'fa-triangle-exclamation',
  iconeClasse: 'bg-rose-100 text-rose-600',
  confirmLabel: 'Supprimer',
  confirmIcone: 'fa-trash',
  confirmClasse: 'bg-rose-600 shadow-rose-200 hover:bg-rose-700',
};

const estOuvert = ref(false);
const options = ref({ ...OPTIONS_PAR_DEFAUT, message: '' });
let resoudre = null;

function terminer(valeur) {
  estOuvert.value = false;
  resoudre?.(valeur);
  resoudre = null;
}

export function useConfirm() {
  // `message` peut contenir du gras (rendu via v-html) : les valeurs
  // dynamiques qu'on y insère doivent passer par escapeHtml().
  function demanderConfirmation(message, personnalisation = {}) {
    options.value = { ...OPTIONS_PAR_DEFAUT, ...personnalisation, message };
    estOuvert.value = true;

    return new Promise((resolve) => {
      resoudre = resolve;
    });
  }

  return {
    estOuvert,
    options,
    demanderConfirmation,
    confirmer: () => terminer(true),
    annuler: () => terminer(false),
  };
}
