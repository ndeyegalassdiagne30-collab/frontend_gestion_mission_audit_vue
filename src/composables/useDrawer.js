import { ref, shallowRef } from 'vue';

// Panneau latéral unique, monté une seule fois dans App.vue et piloté d'ici.
// Il sert partout : consultation d'une fiche, création et modification.
const estOuvert = ref(false);
const titre = ref('');
const sousTitre = ref('');
const icone = ref('fa-circle-info');
const iconeClasse = ref('bg-brand/10 text-brand');

// shallowRef : on stocke un composant, pas un objet réactif à parcourir.
const composantActif = shallowRef(null);
const propsActives = ref({});

export function useDrawer() {
  function ouvrir(composant, {
    titre: titreDrawer = '',
    sousTitre: sousTitreDrawer = '',
    icone: iconeDrawer = 'fa-circle-info',
    iconeClasse: iconeClasseDrawer = 'bg-brand/10 text-brand',
    props = {},
  } = {}) {
    composantActif.value = composant;
    propsActives.value = props;
    titre.value = titreDrawer;
    sousTitre.value = sousTitreDrawer;
    icone.value = iconeDrawer;
    iconeClasse.value = iconeClasseDrawer;
    estOuvert.value = true;
  }

  function fermer() {
    estOuvert.value = false;
  }

  // Appelé à la fin de l'animation de sortie : on ne vide le contenu qu'une
  // fois le panneau réellement sorti de l'écran.
  function reinitialiser() {
    composantActif.value = null;
    propsActives.value = {};
    titre.value = '';
    sousTitre.value = '';
  }

  return {
    estOuvert,
    titre,
    sousTitre,
    icone,
    iconeClasse,
    composantActif,
    propsActives,
    ouvrir,
    fermer,
    reinitialiser,
  };
}
