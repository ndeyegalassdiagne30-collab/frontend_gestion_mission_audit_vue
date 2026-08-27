<script setup>
import { computed } from 'vue';

import PageHeader from '@/components/ui/PageHeader.vue';
import UserAvatar from '@/components/ui/UserAvatar.vue';
import ProfileForm from '@/components/forms/ProfileForm.vue';

import { useAuthStore } from '@/stores/auth.js';
import { useDrawer } from '@/composables/useDrawer.js';
import { ROLE_LABELS } from '@/utils/statuts.js';

const auth = useAuthStore();
const { ouvrir } = useDrawer();

const utilisateur = computed(() => auth.utilisateur);

const libelleRole = computed(
  () => ROLE_LABELS[utilisateur.value?.role] || utilisateur.value?.role,
);

function ouvrirModification() {
  ouvrir(ProfileForm, {
    titre: 'Modifier mon profil',
    icone: 'fa-user-pen',
  });
}
</script>

<template>
  <section>
    <PageHeader titre="Mon profil" />

    <article
      class="af-card mx-auto max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <div class="flex items-center gap-4">
        <UserAvatar
          :utilisateur="utilisateur"
          taille="h-16 w-16"
          texte="text-lg font-black"
          secours=""
        />

        <div>
          <p class="text-lg font-black text-slate-950">
            {{ utilisateur?.prenom }} {{ utilisateur?.nom }}
          </p>

          <span class="af-badge rounded-full bg-brand/10 px-3 py-1 text-xs font-bold text-brand">
            {{ libelleRole }}
          </span>
        </div>
      </div>

      <div class="mt-6 grid gap-3 border-t border-slate-100 pt-6 text-sm text-slate-700">
        <p><strong class="text-slate-950">Email :</strong> {{ utilisateur?.email }}</p>
        <p><strong class="text-slate-950">Téléphone :</strong> {{ utilisateur?.telephone }}</p>
      </div>

      <div class="mt-6 flex justify-end">
        <button
          type="button"
          @click="ouvrirModification"
          class="af-btn-primary inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-extrabold text-white"
        >
          <i class="fa-solid fa-pen"></i>
          <span>Modifier mon profil</span>
        </button>
      </div>
    </article>
  </section>
</template>
