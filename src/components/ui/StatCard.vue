<script setup>
// Carte statistique du tableau de bord.
// `couleur` alimente la variable CSS --af-kpi-color : liseré gauche et halo.
defineProps({
  icone: { type: String, required: true },
  iconeClasse: { type: String, default: 'bg-brand/10 text-brand' },
  valeur: { type: [Number, String], required: true },
  label: { type: String, required: true },
  couleur: { type: String, default: '#4A1946' },
});
</script>

<template>
  <article
    class="af-card af-kpi flex min-h-[9.5rem] flex-col justify-between rounded-[2rem] border border-slate-200 bg-white py-6 pl-8 pr-6 shadow-sm"
    :style="{ '--af-kpi-color': couleur }"
  >
    <div class="flex items-center justify-between">
      <div class="flex h-12 w-12 items-center justify-center rounded-2xl" :class="iconeClasse">
        <i class="fa-solid text-lg" :class="icone"></i>
      </div>
    </div>

    <div>
      <p class="text-3xl font-black tracking-tight text-slate-950">{{ valeur }}</p>
      <p class="mt-1 text-sm font-semibold text-slate-500">{{ label }}</p>
    </div>
  </article>
</template>
