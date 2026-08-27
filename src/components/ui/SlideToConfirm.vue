<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';

// « Glisser pour confirmer » (inspiré du Slide to Unlock).
// S'active au pointeur/tactile ou au clavier ; l'état est remonté via v-model.
defineProps({
  label: { type: String, default: 'Glisser pour confirmer' },
  labelConfirme: { type: String, default: 'Confirmé' },
  labelReinitialiser: { type: String, default: 'Retirer' },
  ariaLabel: { type: String, default: '' },
});

const confirme = defineModel({ type: Boolean, default: false });

// Au-delà de 65 % du parcours, le relâchement valide (effet magnétique).
const SEUIL_CONFIRMATION = 0.65;

const piste = ref(null);
const curseur = ref(null);

const distance = ref(0); // position actuelle du curseur, en pixels
const distanceMax = ref(0); // parcours maximal du curseur dans la piste
const enGlissement = ref(false);

let departX = 0;
let observateur = null;

function calculerDistanceMax() {
  if (!piste.value || !curseur.value) {
    return;
  }

  distanceMax.value = piste.value.getBoundingClientRect().width - curseur.value.offsetWidth - 8;
}

const proportion = computed(
  () => (distanceMax.value > 0 ? distance.value / distanceMax.value : 0),
);

// 11 % minimum pour que le remplissage reste visible sous le curseur
const largeurRemplissage = computed(() => `${Math.max(11, proportion.value * 100)}%`);

const styleCurseur = computed(() => ({
  transform: `translateX(${distance.value}px) scale(${enGlissement.value ? 1.06 : 1})`,
  // Pendant le glissement, on suit la souris sans latence.
  transition: enGlissement.value ? 'none' : '',
}));

const styleLabel = computed(() => ({
  // Le texte s'estompe à mesure que l'on glisse
  opacity: String(1 - proportion.value * 0.9),
  color: confirme.value ? '#fff' : '',
}));

function definir(valeur) {
  confirme.value = valeur;
}

// Replace le curseur quand l'état change, y compris si le parent le pilote
watch(confirme, (valeur) => {
  calculerDistanceMax();
  distance.value = valeur ? distanceMax.value : 0;
});

function debutGlissement(evenement) {
  if (confirme.value) {
    return; // déjà confirmé : il faut passer par le bouton « Retirer »
  }

  enGlissement.value = true;
  departX = evenement.clientX;
  calculerDistanceMax();
  curseur.value?.setPointerCapture?.(evenement.pointerId);
}

function positionBornee(evenement) {
  return Math.min(Math.max(evenement.clientX - departX, 0), distanceMax.value);
}

function glissement(evenement) {
  if (!enGlissement.value) {
    return;
  }

  distance.value = positionBornee(evenement);
}

function finGlissement(evenement) {
  if (!enGlissement.value) {
    return;
  }

  const parcours = positionBornee(evenement);
  enGlissement.value = false;

  const atteint = distanceMax.value > 0 && parcours / distanceMax.value >= SEUIL_CONFIRMATION;

  if (atteint === confirme.value) {
    // L'état ne change pas : le watcher ne se déclenchera pas, on replace
    // le curseur nous-mêmes (effet magnétique de retour).
    distance.value = confirme.value ? distanceMax.value : 0;
    return;
  }

  definir(atteint);
}

// Accessibilité : le composant s'active aussi entièrement au clavier
function surTouche(evenement) {
  if (evenement.key === 'Enter' || evenement.key === ' ') {
    evenement.preventDefault();
    definir(!confirme.value);
  } else if (evenement.key === 'ArrowRight') {
    evenement.preventDefault();
    definir(true);
  } else if (evenement.key === 'ArrowLeft') {
    evenement.preventDefault();
    definir(false);
  }
}

onMounted(() => {
  calculerDistanceMax();
  distance.value = confirme.value ? distanceMax.value : 0;

  window.addEventListener('pointermove', glissement);
  window.addEventListener('pointerup', finGlissement);

  // Le panneau latéral peut changer de largeur pendant que le composant est affiché
  observateur = new ResizeObserver(() => {
    calculerDistanceMax();
    distance.value = confirme.value ? distanceMax.value : 0;
  });

  if (piste.value) {
    observateur.observe(piste.value);
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', glissement);
  window.removeEventListener('pointerup', finGlissement);
  observateur?.disconnect();
});
</script>

<template>
  <div class="af-slide-wrap">
    <!-- role="switch" + aria-checked : les lecteurs d'écran l'annoncent comme un interrupteur -->
    <div
      ref="piste"
      class="af-slide-track relative h-14 w-full select-none overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
      :class="{ 'af-slide-track-confirmed': confirme }"
      role="switch"
      tabindex="0"
      :aria-label="ariaLabel || label"
      :aria-checked="confirme"
      @keydown="surTouche"
    >
      <!-- Remplissage coloré qui grandit au fur et à mesure du glissement -->
      <div
        class="af-slide-fill pointer-events-none absolute inset-y-0 left-0 bg-brand/15"
        :style="{ width: largeurRemplissage }"
      ></div>

      <p
        class="pointer-events-none absolute inset-0 flex items-center justify-center text-sm font-bold text-slate-500"
        :style="styleLabel"
      >
        {{ confirme ? labelConfirme : label }}
      </p>

      <div
        ref="curseur"
        class="af-slide-thumb absolute left-1 top-1 flex h-11 w-11 cursor-grab items-center justify-center rounded-xl bg-brand text-white shadow-lg active:cursor-grabbing"
        :style="styleCurseur"
        @pointerdown="debutGlissement"
      >
        <i class="fa-solid text-sm" :class="confirme ? 'fa-check' : 'fa-arrow-right'"></i>
      </div>
    </div>

    <button
      v-if="confirme"
      type="button"
      @click="definir(false)"
      class="af-btn-ghost mt-2 flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-rose-600"
    >
      <i class="fa-solid fa-rotate-left"></i>
      <span>{{ labelReinitialiser }}</span>
    </button>
  </div>
</template>
