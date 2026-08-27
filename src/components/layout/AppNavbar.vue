<script setup>
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth.js';
import UserAvatar from '@/components/ui/UserAvatar.vue';

defineEmits(['ouvrir-menu']);

const auth = useAuthStore();

const prenomAffiche = computed(() => auth.utilisateur?.prenom || 'Utilisateur');
</script>

<template>
  <header
    class="af-header fixed inset-x-0 top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-slate-200/80 px-4 sm:px-6 lg:left-72"
  >
    <div class="flex min-w-0 items-center gap-3">
      <button
        type="button"
        @click="$emit('ouvrir-menu')"
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 lg:hidden"
        aria-label="Ouvrir le menu"
      >
        <i class="fa-solid fa-bars"></i>
      </button>

      <label
        class="af-search relative hidden items-center rounded-full border border-slate-200 bg-slate-50 sm:flex"
      >
        <i
          class="fa-solid fa-magnifying-glass pointer-events-none absolute left-4 text-sm text-slate-400"
        ></i>

        <input
          type="search"
          placeholder="Rechercher..."
          class="w-48 bg-transparent py-2.5 pl-10 pr-4 text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400 md:w-72"
        />
      </label>
    </div>

    <div class="flex shrink-0 items-center gap-3 sm:gap-4">
      <span class="hidden text-sm font-bold text-slate-700 sm:inline">
        Bonjour, <span class="text-brand">{{ prenomAffiche }}</span>
      </span>

      <div class="hidden h-8 w-px bg-slate-200 sm:block"></div>

      <UserAvatar :utilisateur="auth.utilisateur" fond="bg-brand text-white" />
    </div>
  </header>
</template>
