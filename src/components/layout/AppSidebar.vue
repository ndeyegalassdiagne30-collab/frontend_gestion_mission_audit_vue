<script setup>
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.js';
import { useNavigation } from '@/composables/useNavigation.js';

defineProps({
  ouverte: { type: Boolean, default: false },
});

const emit = defineEmits(['update:ouverte']);

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

// Liens partagés avec la barre d'onglets mobile (AppBottomBar) : une seule
// liste à maintenir pour les deux navigations.
const { liens } = useNavigation();

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
