import { defineStore } from 'pinia';
import * as authService from '@/services/authService.js';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    utilisateur: authService.utilisateurCourant(),
    connecte: authService.estConnecte(),
  }),

  getters: {
    role: (state) => state.utilisateur?.role ?? null,
    estAdmin: (state) => state.utilisateur?.role === 'administrateur',
    estExpertComptable: (state) => state.utilisateur?.role === 'expert_comptable',
    estAuditeur: (state) => state.utilisateur?.role === 'auditeur',
    // Rôle « client » : compte créé depuis la fiche client
    estClient: (state) => state.utilisateur?.role === 'client',

    // Page ouverte après connexion : le client n'a pas accès au tableau de bord
    routeParDefaut: (state) => (state.utilisateur?.role === 'client' ? 'missions' : 'dashboard'),
  },

  actions: {
    async login(email, motDePasse) {
      this.utilisateur = await authService.connecter(email, motDePasse);
      this.connecte = true;
    },

    async logout() {
      await authService.deconnecter();
      this.utilisateur = null;
      this.connecte = false;
    },

    // Rafraîchit la session locale après la modification de « Mon profil »
    majUtilisateur(utilisateur) {
      this.utilisateur = authService.enregistrerUtilisateurCourant(utilisateur);
    },
  },
});
