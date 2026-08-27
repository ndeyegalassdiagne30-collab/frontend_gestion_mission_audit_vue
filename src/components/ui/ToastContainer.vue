<script setup>
import { useToast } from '@/composables/useToast.js';

const { toasts } = useToast();

const CLASSES_TYPE = {
  succes: 'bg-gradient-to-r from-brand-light to-brand-dark text-white shadow-brand/40',
  erreur: 'bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-rose-500/30',
};

const ICONES_TYPE = {
  succes: 'fa-circle-check',
  erreur: 'fa-circle-exclamation',
};
</script>

<template>
  <Teleport to="body">
    <div class="pointer-events-none fixed right-5 top-20 z-50 flex flex-col items-end gap-2">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="af-toast pointer-events-auto max-w-sm rounded-2xl px-4 py-3.5 text-sm font-semibold shadow-2xl"
          :class="CLASSES_TYPE[toast.type]"
        >
          <span class="inline-flex items-center gap-3">
            <span
              class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20"
            >
              <i class="fa-solid text-sm" :class="ICONES_TYPE[toast.type]"></i>
            </span>
            <span>{{ toast.message }}</span>
          </span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
/* L'entrée est déjà animée par .af-toast (af-slide-in-right) :
   on ne gère ici que la sortie et le décalage des toasts restants. */
.toast-leave-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.toast-move {
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
</style>
