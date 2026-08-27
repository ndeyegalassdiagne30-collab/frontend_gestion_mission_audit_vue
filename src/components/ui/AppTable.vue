<script setup>
// Tableau générique : en-têtes, lignes et état vide.
// Chaque colonne peut être personnalisée via le slot #cellule-<cle> ;
// sans slot, on retombe sur la valeur brute de la ligne.
//
// Une colonne : { cle, label, largeur?, alignement? }
//  - `largeur` n'agit qu'à partir de md (table-layout: fixed) ; en dessous le
//    tableau reste en layout auto + scroll horizontal pour rester lisible.
//  - les colonnes sans largeur se partagent l'espace restant.
defineProps({
  colonnes: { type: Array, required: true },
  lignes: { type: Array, required: true },
  messageVide: { type: String, default: 'Aucune donnée disponible.' },
});

const CLASSES_ALIGNEMENT = {
  center: 'text-center',
  right: 'text-right',
  left: 'text-left',
};

function classeAlignement(alignement) {
  return CLASSES_ALIGNEMENT[alignement] || CLASSES_ALIGNEMENT.left;
}
</script>

<template>
  <div
    v-if="lignes.length === 0"
    class="af-animate-fade flex flex-col items-center gap-3 rounded-[2rem] border border-dashed border-slate-300 bg-slate-50/70 px-5 py-14 text-center"
  >
    <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 text-brand">
      <i class="fa-solid fa-inbox text-xl"></i>
    </div>

    <p class="text-sm font-semibold text-slate-500">{{ messageVide }}</p>
  </div>

  <div
    v-else
    class="af-table-wrap overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm"
  >
    <div class="max-h-[70vh] overflow-auto md:overflow-x-hidden">
      <table class="af-table w-full min-w-[720px] border-collapse md:min-w-0 md:table-fixed">
        <colgroup>
          <col
            v-for="colonne in colonnes"
            :key="colonne.cle"
            :style="colonne.largeur ? { width: colonne.largeur } : null"
          />
        </colgroup>

        <thead class="bg-gradient-to-r from-brand to-brand-dark">
          <tr>
            <th
              v-for="colonne in colonnes"
              :key="colonne.cle"
              class="whitespace-nowrap px-3 py-3.5 text-xs font-black uppercase tracking-[0.06em] text-white/90 md:whitespace-normal md:break-words md:text-[0.68rem] md:leading-tight md:tracking-[0.04em]"
              :class="classeAlignement(colonne.alignement)"
            >
              {{ colonne.label }}
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-slate-100">
          <tr v-for="ligne in lignes" :key="ligne.id">
            <td
              v-for="colonne in colonnes"
              :key="colonne.cle"
              class="px-3 py-3 align-middle text-sm text-slate-700 md:break-words"
              :class="classeAlignement(colonne.alignement)"
            >
              <slot
                :name="`cellule-${colonne.cle}`"
                :ligne="ligne"
                :valeur="ligne[colonne.cle]"
              >
                {{ ligne[colonne.cle] ?? '-' }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
