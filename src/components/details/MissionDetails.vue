<script setup>
import { computed } from 'vue';
import DrawerFooter from '@/components/ui/DrawerFooter.vue';
import { sameId } from '@/utils/id.js';
import { STATUT_MISSION_LABELS } from '@/utils/statuts.js';

const props = defineProps({
  mission: { type: Object, required: true },
  clients: { type: Array, default: () => [] },
  experts: { type: Array, default: () => [] },
  utilisateurs: { type: Array, default: () => [] },
});

const emit = defineEmits(['fermer']);

const client = computed(
  () => props.clients.find((element) => sameId(element.id, props.mission.clientId)),
);

const expert = computed(
  () => props.experts.find((element) => sameId(element.id, props.mission.expertComptableId)),
);

const auditeurs = computed(
  () => props.utilisateurs.filter(
    (utilisateur) => (props.mission.auditeurs || []).some((id) => sameId(id, utilisateur.id)),
  ),
);

const listeAuditeurs = computed(
  () => auditeurs.value.map((auditeur) => `${auditeur.prenom} ${auditeur.nom}`).join(', ') || 'Aucun',
);

const libelleStatut = computed(
  () => STATUT_MISSION_LABELS[props.mission.statut] || props.mission.statut,
);
</script>

<template>
  <form class="grid content-start gap-4" @submit.prevent="emit('fermer')">
    <div class="grid gap-3 text-sm text-slate-700">
      <p><strong class="text-slate-950">Titre :</strong> {{ mission.titre }}</p>
      <p><strong class="text-slate-950">Description :</strong> {{ mission.description || '-' }}</p>
      <p><strong class="text-slate-950">Client :</strong> {{ client?.raison_sociale || '-' }}</p>
      <p>
        <strong class="text-slate-950">Expert-comptable :</strong>
        {{ expert ? `${expert.prenom} ${expert.nom}` : '-' }}
      </p>
      <p><strong class="text-slate-950">Auditeurs :</strong> {{ listeAuditeurs }}</p>
      <p>
        <strong class="text-slate-950">Période :</strong>
        {{ mission.date_debut }} → {{ mission.date_fin_prevue }}
      </p>
      <p><strong class="text-slate-950">Avancement :</strong> {{ mission.avancement }}%</p>
      <p><strong class="text-slate-950">Statut :</strong> {{ libelleStatut }}</p>
    </div>

    <DrawerFooter label="Fermer" icone="fa-xmark" @annuler="emit('fermer')" />
  </form>
</template>
