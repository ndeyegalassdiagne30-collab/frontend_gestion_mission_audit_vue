<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { useAuthStore } from '@/stores/auth.js';

const auth = useAuthStore();

// Un visiteur non connecté est renvoyé vers la connexion, un utilisateur
// connecté vers la page d'accueil de son rôle.
const destination = computed(() => (
  auth.connecte ? { name: auth.routeParDefaut } : { name: 'login' }
));

const libelleBouton = computed(() => (
  auth.connecte ? "Retour à l'accueil" : 'Aller à la connexion'
));
</script>

<template>
  <div class="af-404 relative grid min-h-screen place-items-center overflow-hidden px-5 py-12">
    <!-- Rayons en éventail : repeating-conic-gradient évite de dessiner
         trente triangles à la main. -->
    <div class="af-404-rayons" aria-hidden="true"></div>
    <div class="af-404-voile" aria-hidden="true"></div>

    <div class="relative z-10 flex w-full max-w-2xl flex-col items-center text-center">
      <!-- Le robot est un SVG en ligne : aucun fichier image à charger, et il
           reste net sur tous les écrans. -->
      <svg
        class="af-404-robot w-40 sm:w-52"
        viewBox="0 0 200 210"
        fill="none"
        role="img"
        aria-label="Robot dépité"
      >
        <ellipse cx="100" cy="196" rx="52" ry="9" fill="#220A1F" opacity="0.35" />

        <!-- Antenne -->
        <line x1="100" y1="20" x2="100" y2="44" stroke="#220A1F" stroke-width="7" stroke-linecap="round" />
        <circle class="af-404-antenne" cx="100" cy="14" r="9" fill="#8B3F82" />

        <!-- Bras -->
        <rect x="6" y="104" width="34" height="15" rx="7.5" fill="#220A1F" transform="rotate(-18 23 111)" />
        <rect x="160" y="104" width="34" height="15" rx="7.5" fill="#220A1F" transform="rotate(18 177 111)" />

        <!-- Corps -->
        <rect x="34" y="44" width="132" height="126" rx="34" fill="#220A1F" />
        <rect x="34" y="44" width="132" height="126" rx="34" fill="url(#af404degrade)" />

        <!-- Yeux -->
        <circle cx="72" cy="94" r="23" fill="#FFFFFF" />
        <circle cx="128" cy="94" r="23" fill="#FFFFFF" />
        <circle class="af-404-oeil" cx="72" cy="94" r="12" fill="#6B2864" />
        <circle class="af-404-oeil" cx="128" cy="94" r="12" fill="#6B2864" />
        <circle cx="76" cy="90" r="4" fill="#FFFFFF" opacity="0.9" />
        <circle cx="132" cy="90" r="4" fill="#FFFFFF" opacity="0.9" />

        <!-- Bouche -->
        <rect x="66" y="130" width="68" height="24" rx="12" fill="#33102F" />
        <line x1="78" y1="138" x2="122" y2="138" stroke="#8B3F82" stroke-width="4" stroke-linecap="round" />
        <line x1="78" y1="146" x2="122" y2="146" stroke="#8B3F82" stroke-width="4" stroke-linecap="round" />

        <defs>
          <linearGradient id="af404degrade" x1="34" y1="44" x2="166" y2="170" gradientUnits="userSpaceOnUse">
            <stop stop-color="#FFFFFF" stop-opacity="0.14" />
            <stop offset="1" stop-color="#FFFFFF" stop-opacity="0" />
          </linearGradient>
        </defs>
      </svg>

      <p class="af-404-oops mt-6">Ooooops&nbsp;!</p>

      <p class="af-404-code">404</p>

      <p class="af-404-cadre">Erreur… page introuvable</p>

      <p class="mt-7 max-w-md text-sm leading-6 text-white/70">
        Cette page n'existe pas ou a été déplacée. Vérifie l'adresse saisie,
        ou reviens en terrain connu.
      </p>

      <RouterLink
        :to="destination"
        class="af-404-bouton mt-8 inline-flex items-center gap-2.5 rounded-2xl px-7 py-3.5 text-sm font-extrabold"
      >
        <i class="fa-solid fa-arrow-left"></i>
        <span>{{ libelleBouton }}</span>
      </RouterLink>
    </div>
  </div>
</template>
