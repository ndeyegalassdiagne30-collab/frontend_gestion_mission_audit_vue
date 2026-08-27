import { apiClient } from './apiClient.js';
import { sameId } from '@/utils/id.js';

// Met en forme les données saisies avant envoi à l'API.
// L'email est envoyé à null quand il est vide : l'API le valide en tant
// qu'email dès qu'une chaîne est présente, une chaîne vide serait refusée.
function normaliser(donnees) {
  const email = String(donnees.email || '').trim();

  return {
    raison_sociale: String(donnees.raison_sociale || '').trim(),
    ninea: String(donnees.ninea || '').trim(),
    adresse: String(donnees.adresse || '').trim(),
    telephone: String(donnees.telephone || '').trim(),
    email: email || null,
    date_creation: donnees.date_creation,
    statut: donnees.statut || 'actif',
  };
}

// L'API renvoie un simple « Cette valeur existe déjà. » sur les doublons :
// on contrôle en amont pour pouvoir désigner précisément le champ fautif.
async function verifierUnicite(donnees, idAExclure) {
  const existants = await listerClients();
  const telephone = String(donnees.telephone).trim();

  const telephonePris = existants.some(
    (client) => !sameId(client.id, idAExclure) && String(client.telephone).trim() === telephone,
  );

  if (telephonePris) {
    throw new Error('Ce téléphone est déjà utilisé par un autre client.');
  }

  const email = String(donnees.email || '').trim().toLowerCase();

  if (!email) {
    return;
  }

  const emailPris = existants.some(
    (client) => !sameId(client.id, idAExclure)
      && String(client.email || '').trim().toLowerCase() === email,
  );

  if (emailPris) {
    throw new Error('Cet email est déjà utilisé par un autre client.');
  }
}

export async function listerClients() {
  const clients = await apiClient.get('/clients');

  return Array.isArray(clients) ? clients : [];
}

export async function creerClient(donnees) {
  const client = normaliser(donnees);

  await verifierUnicite(client);

  return apiClient.post('/clients', client);
}

export async function modifierClient(id, donnees) {
  const client = normaliser(donnees);

  await verifierUnicite(client, id);

  return apiClient.patch(`/clients/${id}`, client);
}

export async function supprimerClient(id) {
  return apiClient.delete(`/clients/${id}`);
}
