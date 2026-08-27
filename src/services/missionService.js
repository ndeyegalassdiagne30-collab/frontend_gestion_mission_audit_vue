import { apiClient } from './apiClient.js';

// Les <select> et <input> renvoient des chaînes : l'API attend des entiers
// pour les identifiants et l'avancement.
function versEntier(valeur) {
  const nombre = Number(valeur);

  return Number.isFinite(nombre) ? nombre : null;
}

function normaliser(donnees) {
  return {
    titre: String(donnees.titre || '').trim(),
    description: String(donnees.description || '').trim(),
    date_debut: donnees.date_debut,
    date_fin_prevue: donnees.date_fin_prevue,
    avancement: versEntier(donnees.avancement) ?? 0,
    statut: donnees.statut || 'en_cours',
    clientId: versEntier(donnees.clientId),
    expertComptableId: versEntier(donnees.expertComptableId),
    auditeurs: (donnees.auditeurs || []).map(versEntier).filter((id) => id !== null),
  };
}

export async function listerMissions() {
  const missions = await apiClient.get('/missions');

  return Array.isArray(missions) ? missions : [];
}

export async function creerMission(donnees) {
  return apiClient.post('/missions', normaliser(donnees));
}

export async function modifierMission(id, donnees) {
  return apiClient.patch(`/missions/${id}`, normaliser(donnees));
}

// Mise à jour partielle utilisée par l'auditeur (avancement / statut) et par
// l'expert-comptable lors de la clôture : on n'envoie que les champs modifiés
// pour ne pas rejouer les contrôles de cohérence des dates.
export async function modifierPartiellement(id, donnees) {
  return apiClient.patch(`/missions/${id}`, donnees);
}

export async function supprimerMission(id) {
  return apiClient.delete(`/missions/${id}`);
}

// Route dédiée de l'API, ouverte à l'administrateur et à l'expert-comptable
export async function affecterAuditeurs(id, auditeurs) {
  return apiClient.patch(`/missions/${id}/auditeurs`, {
    auditeurs: auditeurs.map(versEntier).filter((valeur) => valeur !== null),
  });
}
