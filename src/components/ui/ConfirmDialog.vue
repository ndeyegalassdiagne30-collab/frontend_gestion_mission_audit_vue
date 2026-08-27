<script setup>
import { onBeforeUnmount, onMounted } from 'vue';
import { useConfirm } from '@/composables/useConfirm.js';

// Dialogue de confirmation utilisé avant chaque suppression et, via les
// options du composable, pour toute action à confirmer explicitement
// (clôture d'une mission, retrait d'un auditeur...).
const { estOuvert, options, confirmer, annuler } = useConfirm();

function surTouche(evenement) {
  if (evenement.key === 'Escape' && estOuvert.value) {
    annuler();
  }
}

onMounted(() => document.addEventListener('keydown', surTouche));
onBeforeUnmount(() => document.removeEventListener('keydown', surTouche));
</script>

<template>
  <Teleport to="body">
    <div
      v-if="estOuvert"
      class="af-modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md"
      role="alertdialog"
      aria-modal="true"
      @click.self="annuler"
    >
      <div class="af-modal-panel w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
        <div class="mb-4 flex items-center gap-3">
          <div
            class="flex h-11 w-11 items-center justify-center rounded-2xl"
            :class="options.iconeClasse"
          >
            <i class="fa-solid" :class="options.icone"></i>
          </div>

          <h2 class="text-xl font-black tracking-tight text-slate-950">
            {{ options.titre }}
          </h2>
        </div>

        <!-- Le message peut contenir du gras : les valeurs dynamiques qu'on y
             insère sont échappées par l'appelant (escapeHtml). -->
        <p class="text-sm leading-6 text-slate-600" v-html="options.message"></p>

        <div class="mt-6 flex justify-end gap-3">
          <button
            type="button"
            @click="annuler"
            class="af-btn-ghost rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            Annuler
          </button>

          <button
            type="button"
            @click="confirmer"
            class="af-btn-icon inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-extrabold text-white shadow-lg transition"
            :class="options.confirmClasse"
          >
            <i class="fa-solid" :class="options.confirmIcone"></i>
            <span>{{ options.confirmLabel }}</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
