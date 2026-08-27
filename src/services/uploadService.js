import { apiClient } from './apiClient.js';

const TAILLE_MAX = 10 * 1024 * 1024;

// Envoie un fichier (photo de profil ou document) vers Cloudinary via l'API
// et retourne { url, publicId }.
export async function envoyerFichier(fichier) {
  if (!fichier) {
    return null;
  }

  if (fichier.size > TAILLE_MAX) {
    throw new Error('Le fichier ne doit pas dépasser 10 Mo.');
  }

  const formData = new FormData();
  formData.append('fichier', fichier);

  return apiClient.post('/uploads', formData);
}
