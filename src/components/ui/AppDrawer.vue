<script setup>
import { onBeforeUnmount, onMounted, watch } from 'vue';
import { useDrawer } from '@/composables/useDrawer.js';

// Panneau latéral unique de l'application : consultation, création, modification.
// Le contenu est un composant passé au composable useDrawer().
const {
  estOuvert,
  titre,
  sousTitre,
  icone,
  iconeClasse,
  composantActif,
  propsActives,
  fermer,
  reinitialiser,
} = useDrawer();

function surTouche(evenement) {
  if (evenement.key === 'Escape' && estOuvert.value) {
    fermer();
  }
}

// Empêche le défilement de la page tant que le panneau est ouvert
watch(estOuvert, (ouvert) => {
  document.body.style.overflow = ouvert ? 'hidden' : '';
});

onMounted(() => document.addEventListener('keydown', surTouche));

onBeforeUnmount(() => {
  document.removeEventListener('keydown', surTouche);
  document.body.style.overflow = '';
});
</script>

<template>
  <Teleport to="body">
    <!-- :duration force Vue à attendre la fin du glissement du panneau :
         la transition CSS porte sur les enfants, pas sur la racine. -->
    <Transition name="drawer" :duration="350" @after-leave="reinitialiser">
      <div v-if="estOuvert" class="fixed inset-0 z-50" role="dialog" aria-modal="true">
        <div
          class="af-drawer-overlay absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          @click="fermer"
        ></div>

        <div
          class="af-drawer-panel absolute right-0 top-0 flex h-full w-full flex-col rounded-l-2xl bg-white shadow-2xl sm:w-[75%] lg:w-[40%] lg:min-w-[420px]"
        >
          <div class="flex items-start justify-between gap-3 border-b border-slate-100 px-6 py-5">
            <div class="flex min-w-0 items-center gap-3">
              <div
                class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                :class="iconeClasse"
              >
                <i class="fa-solid" :class="icone"></i>
              </div>

              <div class="min-w-0">
                <h2 class="truncate text-xl font-black tracking-tight text-slate-950">
                  {{ titre }}
                </h2>
                <p v-if="sousTitre" class="truncate text-sm text-slate-500">{{ sousTitre }}</p>
              </div>
            </div>

            <button
              type="button"
              @click="fermer"
              class="af-btn-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Fermer"
            >
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div class="flex-1 overflow-y-auto px-6 py-5">
            <component :is="composantActif" v-bind="propsActives" @fermer="fermer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Les durées et courbes sont portées par .af-drawer-overlay et
   .af-drawer-panel (main.css) : on ne décrit ici que les états de départ
   et d'arrivée. */
.drawer-enter-from :deep(.af-drawer-overlay),
.drawer-leave-to :deep(.af-drawer-overlay) {
  opacity: 0;
}

.drawer-enter-from :deep(.af-drawer-panel),
.drawer-leave-to :deep(.af-drawer-panel) {
  transform: translateX(100%);
}
</style>
