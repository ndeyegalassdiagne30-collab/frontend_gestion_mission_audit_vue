<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import UserAvatar from '@/components/ui/UserAvatar.vue';
import { useConfirm } from '@/composables/useConfirm.js';
import { escapeHtml } from '@/utils/html.js';
import { sameId } from '@/utils/id.js';

// Sélecteur multiple d'auditeurs : un champ affichant les auditeurs choisis
// sous forme de puces retirables, qui ouvre au clic une liste à cocher avec
// recherche par nom et photo/initiales de chaque auditeur.
const props = defineProps({
  auditeurs: { type: Array, default: () => [] },
});

// Tableau des identifiants sélectionnés
const selection = defineModel({ type: Array, default: () => [] });

const { demanderConfirmation } = useConfirm();

const conteneur = ref(null);
const champRecherche = ref(null);
const ouvert = ref(false);
const recherche = ref('');

const auditeursFiltres = computed(() => {
  const terme = recherche.value.trim().toLowerCase();

  if (!terme) {
    return props.auditeurs;
  }

  return props.auditeurs.filter(
    (auditeur) => `${auditeur.prenom} ${auditeur.nom}`.toLowerCase().includes(terme),
  );
});

const auditeursSelectionnes = computed(
  () => props.auditeurs.filter(
    (auditeur) => selection.value.some((id) => sameId(id, auditeur.id)),
  ),
);

function basculer() {
  ouvert.value = !ouvert.value;

  if (ouvert.value) {
    recherche.value = '';
    // Le champ n'existe qu'une fois la liste dépliée
    requestAnimationFrame(() => champRecherche.value?.focus());
  }
}

async function retirer(auditeur) {
  const nom = escapeHtml(`${auditeur.prenom} ${auditeur.nom}`);

  const confirme = await demanderConfirmation(
    `Retirer <strong class="text-slate-950">${nom}</strong> de la liste des auditeurs affectés à cette mission ?`,
    {
      titre: 'Retirer cet auditeur',
      icone: 'fa-user-minus',
      iconeClasse: 'bg-brand/10 text-brand',
      confirmLabel: 'Retirer',
      confirmIcone: 'fa-user-minus',
      confirmClasse: 'bg-brand shadow-brand/30 hover:bg-brand-dark',
    },
  );

  if (!confirme) {
    return;
  }

  selection.value = selection.value.filter((id) => !sameId(id, auditeur.id));
}

function surClicExterieur(evenement) {
  if (conteneur.value && !conteneur.value.contains(evenement.target)) {
    ouvert.value = false;
  }
}

onMounted(() => document.addEventListener('click', surClicExterieur));
onBeforeUnmount(() => document.removeEventListener('click', surClicExterieur));
</script>

<template>
  <div ref="conteneur" class="relative">
    <button
      type="button"
      @click="basculer"
      class="af-input flex min-h-[3rem] w-full flex-wrap items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-left outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
    >
      <span class="flex flex-1 flex-wrap items-center gap-1.5">
        <template v-if="auditeursSelectionnes.length">
          <span
            v-for="auditeur in auditeursSelectionnes"
            :key="auditeur.id"
            class="inline-flex items-center gap-1.5 rounded-full bg-brand/10 py-1 pl-1.5 pr-1.5 text-xs font-semibold text-brand"
          >
            <UserAvatar
              :utilisateur="auditeur"
              taille="h-5 w-5"
              texte="text-[8px] font-bold"
              secours="?"
              :anneau="false"
            />

            {{ auditeur.prenom }} {{ auditeur.nom }}

            <button
              type="button"
              title="Retirer"
              @click.stop="retirer(auditeur)"
              class="flex h-4 w-4 items-center justify-center rounded-full text-brand/70 transition hover:bg-brand/20 hover:text-brand"
            >
              <i class="fa-solid fa-xmark text-[10px]"></i>
            </button>
          </span>
        </template>

        <span v-else class="py-1 text-sm text-slate-400">Sélectionner des auditeurs</span>
      </span>

      <i
        class="fa-solid fa-chevron-down shrink-0 text-xs text-slate-400 transition"
        :class="{ 'rotate-180': ouvert }"
      ></i>
    </button>

    <div
      v-if="ouvert"
      class="af-animate-fade absolute left-0 right-0 top-[calc(100%+6px)] z-20 max-h-72 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-xl"
    >
      <div
        v-if="auditeurs.length"
        class="sticky top-0 z-10 -mx-2 -mt-2 mb-2 bg-white px-2 pb-2 pt-2"
      >
        <div class="relative">
          <i
            class="fa-solid fa-magnifying-glass pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400"
          ></i>

          <input
            ref="champRecherche"
            v-model="recherche"
            type="text"
            placeholder="Rechercher un auditeur..."
            autocomplete="off"
            class="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-8 pr-3 text-sm font-medium text-slate-700 outline-none transition focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/10"
          />
        </div>
      </div>

      <div class="grid gap-0.5">
        <label
          v-for="auditeur in auditeursFiltres"
          :key="auditeur.id"
          class="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <input
            v-model="selection"
            type="checkbox"
            :value="auditeur.id"
            class="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
          />

          <UserAvatar
            :utilisateur="auditeur"
            taille="h-7 w-7"
            texte="text-[10px] font-bold"
            secours="?"
            :anneau="false"
          />

          <span>{{ auditeur.prenom }} {{ auditeur.nom }}</span>
        </label>
      </div>

      <p v-if="!auditeurs.length" class="px-3 py-2 text-sm text-slate-500">
        Aucun auditeur disponible.
      </p>

      <p
        v-else-if="!auditeursFiltres.length"
        class="px-3 py-4 text-center text-sm text-slate-400"
      >
        Aucun auditeur ne correspond à cette recherche.
      </p>
    </div>
  </div>
</template>
