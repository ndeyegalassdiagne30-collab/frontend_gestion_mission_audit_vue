import { apiClient } from './apiClient.js';

export async function listerDocuments() {
  const documents = await apiClient.get('/documents');

  return Array.isArray(documents) ? documents : [];
}

// Le fichier est d'abord téléversé sur Cloudinary (uploadService) ;
// on enregistre ensuite l'URL renvoyée. L'API rattache elle-même le document
// à l'utilisateur connecté.
export async function creerDocument(donnees) {
  return apiClient.post('/documents', {
    titre: String(donnees.titre || '').trim(),
    nom_fichier: String(donnees.nom_fichier || '').trim(),
    chemin: donnees.chemin,
    description: String(donnees.description || '').trim(),
    taille: donnees.taille ?? null,
    missionId: Number(donnees.missionId),
  });
}

export async function supprimerDocument(id) {
  return apiClient.delete(`/documents/${id}`);
}
