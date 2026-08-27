import { apiClient, TOKEN_KEY, USER_KEY, viderSessionLocale } from './apiClient.js';

// Authentifie l'utilisateur via email / mot de passe et ouvre sa session locale
export async function connecter(email, motDePasse) {
  const resultat = await apiClient.post('/auth/login', {
    email,
    mot_de_passe: motDePasse,
  });

  if (!resultat?.token || !resultat?.utilisateur) {
    throw new Error('Réponse de connexion invalide.');
  }

  localStorage.setItem(TOKEN_KEY, resultat.token);
  localStorage.setItem(USER_KEY, JSON.stringify(resultat.utilisateur));

  return resultat.utilisateur;
}

// Le JWT est révoqué côté serveur, mais un échec réseau ne doit pas empêcher
// l'utilisateur de sortir de sa session : on vide le stockage local dans tous les cas.
export async function deconnecter() {
  try {
    await apiClient.post('/auth/logout');
  } catch {
    // Token déjà expiré ou serveur injoignable : on nettoie quand même.
  } finally {
    viderSessionLocale();
  }
}

// Rafraîchit la session locale après la modification du profil de l'utilisateur connecté
export function enregistrerUtilisateurCourant(utilisateur) {
  const { mot_de_passe: _motDePasse, ...sansMotDePasse } = utilisateur;

  localStorage.setItem(USER_KEY, JSON.stringify(sansMotDePasse));

  return sansMotDePasse;
}

export function estConnecte() {
  return Boolean(localStorage.getItem(TOKEN_KEY)) && utilisateurCourant() !== null;
}

export function utilisateurCourant() {
  const valeur = localStorage.getItem(USER_KEY);

  if (!valeur) {
    return null;
  }

  try {
    return JSON.parse(valeur);
  } catch {
    viderSessionLocale();
    return null;
  }
}
