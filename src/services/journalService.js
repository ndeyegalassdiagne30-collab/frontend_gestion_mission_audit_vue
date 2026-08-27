import { apiClient } from './apiClient.js';

// Le journal est alimenté par l'API elle-même à chaque opération réussie :
// le front se contente de le consulter (page réservée à l'administrateur).
export async function listerJournaux() {
  const journaux = await apiClient.get('/journaux_activites');

  return Array.isArray(journaux) ? journaux : [];
}
