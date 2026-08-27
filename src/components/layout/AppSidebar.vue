<script setup>
import { computed } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.js';

defineProps({
  ouverte: { type: Boolean, default: false },
});

const emit = defineEmits(['update:ouverte']);

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const LIENS_ADMIN = [
  { nom: 'dashboard', label: 'Tableau de bord', icone: 'fa-table-cells-large' },
  { nom: 'utilisateurs', label: 'Utilisateurs', icone: 'fa-user' },
  { nom: 'journal', label: "Journal d'activité", icone: 'fa-list-check' },
  { nom: 'clients', label: 'Clients', icone: 'fa-users' },
  { nom: 'missions', label: "Mission d'audit", icone: 'fa-briefcase' },
  { nom: 'documents', label: 'Documents', icone: 'fa-file-lines' },
  { nom: 'profil', label: 'Mon profil', icone: 'fa-circle-user' },
];

const LIENS_EXPERT = [
  { nom: 'dashboard', label: 'Tableau de bord', icone: 'fa-table-cells-large' },
  { nom: 'clients', label: 'Clients', icone: 'fa-users' },
  { nom: 'missions', label: "Mission d'audit", icone: 'fa-briefcase' },
  { nom: 'affectations', label: 'Affectation des auditeurs', icone: 'fa-user-check' },
  { nom: 'documents', label: 'Documents', icone: 'fa-file-lines' },
  { nom: 'profil', label: 'Mon profil', icone: 'fa-circle-user' },
];

const LIENS_AUDITEUR = [
  { nom: 'dashboard', label: 'Tableau de bord', icone: 'fa-table-cells-large' },
  { nom: 'missions', label: 'Mes missions', icone: 'fa-briefcase' },
  { nom: 'documents', label: 'Documents', icone: 'fa-file-lines' },
  { nom: 'profil', label: 'Mon profil', icone: 'fa-circle-user' },
];

const LIENS_CLIENT = [
  { nom: 'missions', label: 'Mes missions', icone: 'fa-briefcase' },
  { nom: 'profil', label: 'Mon profil', icone: 'fa-circle-user' },
];

// Liens de navigation autorisés selon le rôle de l'utilisateur connecté
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

async function seDeconnecter() {
  await auth.logout();
  router.push({ name: 'login' });
}
</script>

<template>
  <aside
    class="af-sidebar fixed inset-y-0 left-0 z-40 flex w-72 flex-col shadow-2xl transition-transform duration-300 lg:translate-x-0"
    :class="ouverte ? 'translate-x-0' : '-translate-x-full'"
  >
    <div class="flex items-center gap-3 px-6 py-6">
      <div
        class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-brand shadow-lg"
      >
        <i class="fa-solid fa-graduation-cap text-lg"></i>
      </div>

      <div class="min-w-0">
        <h1 class="truncate text-lg font-extrabold tracking-tight text-white">AuditFlow</h1>
        <p class="truncate text-xs text-white/55">Gestion des missions d'audit</p>
      </div>
    </div>

    <div class="mx-6 mb-2 h-px bg-white/10"></div>

    <nav
      class="grid flex-1 content-start gap-1.5 overflow-y-auto px-4 py-4"
      aria-label="Navigation principale"
    >
      <RouterLink
        v-for="lien in liens"
        :key="lien.nom"
        :to="{ name: lien.nom }"
        class="af-nav-link flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold"
        :class="{ 'is-active': route.name === lien.nom }"
      >
        <i class="fa-solid w-5 text-center text-[15px]" :class="lien.icone"></i>
        <span>{{ lien.label }}</span>
      </RouterLink>
    </nav>

    <div class="mx-6 h-px bg-white/10"></div>

    <div class="px-4 py-5">
      <button
        type="button"
        @click="seDeconnecter"
        class="af-nav-link flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold"
      >
        <i class="fa-solid fa-arrow-right-from-bracket w-5 text-center text-[15px]"></i>
        <span>Déconnexion</span>
      </button>
    </div>
  </aside>

  <div
    v-if="ouverte"
    @click="emit('update:ouverte', false)"
    class="fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-sm lg:hidden"
  ></div>
</template>
