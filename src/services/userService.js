import { apiClient } from './apiClient.js';
import { sameId } from '@/utils/id.js';

// L'API renvoie « Cette valeur existe déjà. » sur les doublons : on contrôle
// en amont pour désigner précisément le champ fautif. Indispensable sur
// l'email, puisque la connexion retrouve le compte par son email.
async function verifierUnicite(donnees, idAExclure) {
  const existants = await listerUtilisateurs();
  const email = String(donnees.email).trim().toLowerCase();
  const telephone = String(donnees.telephone).trim();

  const emailPris = existants.some(
    (utilisateur) => !sameId(utilisateur.id, idAExclure)
      && String(utilisateur.email).trim().toLowerCase() === email,
  );

  if (emailPris) {
    throw new Error('Cet email est déjà utilisé par un autre utilisateur.');
  }

  const telephonePris = existants.some(
    (utilisateur) => !sameId(utilisateur.id, idAExclure)
      && String(utilisateur.telephone).trim() === telephone,
  );

  if (telephonePris) {
    throw new Error('Ce téléphone est déjà utilisé par un autre utilisateur.');
  }
}

export async function listerUtilisateurs() {
  const utilisateurs = await apiClient.get('/utilisateurs');

  return Array.isArray(utilisateurs) ? utilisateurs : [];
}

export async function creerUtilisateur(donnees) {
  const utilisateur = {
    nom: String(donnees.nom).trim(),
    prenom: String(donnees.prenom).trim(),
    email: String(donnees.email).trim(),
    mot_de_passe: donnees.mot_de_passe,
    telephone: String(donnees.telephone).trim(),
    photo: donnees.photo || '',
    role: donnees.role,
    statut: donnees.statut || 'actif',
    ...(donnees.clientId ? { clientId: Number(donnees.clientId) } : {}),
  };

  await verifierUnicite(utilisateur);

  return apiClient.post('/utilisateurs', utilisateur);
}

// `verifierUnicite` est désactivé depuis « Mon profil » : un auditeur ou un
// client ne reçoit qu'un annuaire réduit (sans email ni téléphone), le
// contrôle n'y aurait aucun sens. L'API répond alors elle-même en 409.
export async function modifierUtilisateur(id, donnees, { controlerUnicite = true } = {}) {
  const payload = {
    nom: String(donnees.nom).trim(),
    prenom: String(donnees.prenom).trim(),
    email: String(donnees.email).trim(),
    telephone: String(donnees.telephone).trim(),
    photo: donnees.photo || '',
    role: donnees.role,
    statut: donnees.statut || 'actif',
  };

  // Le mot de passe n'est transmis que s'il est réellement modifié.
  // L'API exige alors l'ancien mot de passe quand on change le sien.
  if (donnees.mot_de_passe) {
    payload.mot_de_passe = donnees.mot_de_passe;

    if (donnees.ancien_mot_de_passe) {
      payload.ancien_mot_de_passe = donnees.ancien_mot_de_passe;
    }
  }

  if (controlerUnicite) {
    await verifierUnicite(payload, id);
  }

  return apiClient.patch(`/utilisateurs/${id}`, payload);
}

export async function supprimerUtilisateur(id) {
  return apiClient.delete(`/utilisateurs/${id}`);
}
