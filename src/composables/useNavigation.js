import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth.js';

// Source unique des liens de navigation, partagée par la barre latérale
// (bureau) et la barre d'onglets du bas (mobile).
//
// `court` est le libellé affiché sous l'icône sur mobile : la place y est
// comptée, un onglet ne fait qu'un cinquième de l'écran.
const LIENS_ADMIN = [
  { nom: 'dashboard', label: 'Tableau de bord', court: 'Accueil', icone: 'fa-table-cells-large' },
  { nom: 'utilisateurs', label: 'Utilisateurs', court: 'Utilisateurs', icone: 'fa-user' },
  { nom: 'journal', label: "Journal d'activité", court: 'Journal', icone: 'fa-list-check' },
  { nom: 'clients', label: 'Clients', court: 'Clients', icone: 'fa-users' },
  { nom: 'missions', label: "Mission d'audit", court: 'Missions', icone: 'fa-briefcase' },
  { nom: 'documents', label: 'Documents', court: 'Documents', icone: 'fa-file-lines' },
  { nom: 'profil', label: 'Mon profil', court: 'Profil', icone: 'fa-circle-user' },
];

const LIENS_EXPERT = [
  { nom: 'dashboard', label: 'Tableau de bord', court: 'Accueil', icone: 'fa-table-cells-large' },
  { nom: 'clients', label: 'Clients', court: 'Clients', icone: 'fa-users' },
  { nom: 'missions', label: "Mission d'audit", court: 'Missions', icone: 'fa-briefcase' },
  { nom: 'affectations', label: 'Affectation des auditeurs', court: 'Auditeurs', icone: 'fa-user-check' },
  { nom: 'documents', label: 'Documents', court: 'Documents', icone: 'fa-file-lines' },
  { nom: 'profil', label: 'Mon profil', court: 'Profil', icone: 'fa-circle-user' },
];

const LIENS_AUDITEUR = [
  { nom: 'dashboard', label: 'Tableau de bord', court: 'Accueil', icone: 'fa-table-cells-large' },
  { nom: 'missions', label: 'Mes missions', court: 'Missions', icone: 'fa-briefcase' },
  { nom: 'documents', label: 'Documents', court: 'Documents', icone: 'fa-file-lines' },
  { nom: 'profil', label: 'Mon profil', court: 'Profil', icone: 'fa-circle-user' },
];

const LIENS_CLIENT = [
  { nom: 'missions', label: 'Mes missions', court: 'Missions', icone: 'fa-briefcase' },
  { nom: 'profil', label: 'Mon profil', court: 'Profil', icone: 'fa-circle-user' },
];

// Nombre d'onglets affichés avant le bouton « Plus ». Au-delà de quatre, les
// libellés deviennent illisibles sur un écran de téléphone.
const MAX_ONGLETS = 4;

export function useNavigation() {
  const auth = useAuthStore();

  // Liens autorisés selon le rôle de l'utilisateur connecté
  const liens = computed(() => {
    if (auth.estAdmin) {
      return LIENS_ADMIN;
    }

    if (auth.estExpertComptable) {
      return LIENS_EXPERT;
    }

    if (auth.estClient) {
      return LIENS_CLIENT;
    }

    return LIENS_AUDITEUR;
  });

  // Onglets de la barre du bas : pour en changer, il suffit de réordonner les
  // listes ci-dessus (la barre latérale suit le même ordre).
  const onglets = computed(() => liens.value.slice(0, MAX_ONGLETS));

  return { liens, onglets };
}
