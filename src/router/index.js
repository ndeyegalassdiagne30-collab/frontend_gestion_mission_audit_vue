import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth.js';

import LoginView from '@/views/LoginView.vue';
import DashboardView from '@/views/DashboardView.vue';
import ClientsView from '@/views/ClientsView.vue';
import MissionsView from '@/views/MissionsView.vue';
import AffectationsView from '@/views/AffectationsView.vue';
import DocumentsView from '@/views/DocumentsView.vue';
import UtilisateursView from '@/views/UtilisateursView.vue';
import JournalView from '@/views/JournalView.vue';
import ProfilView from '@/views/ProfilView.vue';

// `meta.roles` reprend exactement les droits d'accès de l'ancien routeur.
// Une page sans `roles` est ouverte à tous les utilisateurs connectés.
const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { public: true },
  },
  {
    path: '/',
    redirect: () => ({ name: useAuthStore().routeParDefaut }),
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
    meta: { titre: 'Tableau de bord', roles: ['administrateur', 'expert_comptable', 'auditeur'] },
  },
  {
    path: '/clients',
    name: 'clients',
    component: ClientsView,
    meta: { titre: 'Clients', roles: ['administrateur', 'expert_comptable'] },
  },
  {
    path: '/missions',
    name: 'missions',
    component: MissionsView,
    meta: { titre: "Mission d'audit" },
  },
  {
    path: '/affectations',
    name: 'affectations',
    component: AffectationsView,
    meta: { titre: 'Affectation des auditeurs', roles: ['expert_comptable'] },
  },
  {
    path: '/documents',
    name: 'documents',
    component: DocumentsView,
    meta: { titre: 'Documents', roles: ['administrateur', 'expert_comptable', 'auditeur'] },
  },
  {
    path: '/utilisateurs',
    name: 'utilisateurs',
    component: UtilisateursView,
    meta: { titre: 'Utilisateurs', roles: ['administrateur'] },
  },
  {
    path: '/journal',
    name: 'journal',
    component: JournalView,
    meta: { titre: "Journal d'activité", roles: ['administrateur'] },
  },
  {
    path: '/profil',
    name: 'profil',
    component: ProfilView,
    meta: { titre: 'Mon profil' },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: () => ({ name: useAuthStore().routeParDefaut }),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to) => {
  const auth = useAuthStore();

  if (!auth.connecte) {
    return to.meta.public ? true : { name: 'login' };
  }

  if (to.meta.public) {
    return { name: auth.routeParDefaut };
  }

  // Rôle non autorisé : on renvoie vers la page d'accueil du rôle plutôt que
  // d'afficher une erreur, comme le faisait l'ancien routeur.
  if (Array.isArray(to.meta.roles) && !to.meta.roles.includes(auth.role)) {
    return { name: auth.routeParDefaut };
  }

  return true;
});

export default router;
