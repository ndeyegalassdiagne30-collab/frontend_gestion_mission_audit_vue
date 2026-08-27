const BASE_URL = import.meta.env.VITE_API_URL || 'https://backend-gestion-mission-audit-hono.onrender.com';


export const TOKEN_KEY = 'auditflow_token';
export const USER_KEY = 'auditflow_user';

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}



export function viderSessionLocale() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function preparerBody(body) {
  if (body == null) {
    return undefined;
  }

  // Le navigateur pose lui-même le Content-Type multipart et sa frontière :
  // on renvoie le FormData tel quel (utilisé par /uploads).
  if (body instanceof FormData) {
    return body;
  }

  return JSON.stringify(body);
}

async function lireReponse(reponse) {
  if (reponse.status === 204) {
    return null;
  }

  const contentType = reponse.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return reponse.json().catch(() => null);
  }

  return reponse.text().catch(() => null);
}

// L'API Hono renvoie 400 avec { erreur, details: [{ champ, message }] } :
// on assemble un message lisible plutôt que le générique "Données invalides".
function messageErreur(data) {
  if (typeof data !== 'object' || data === null) {
    return typeof data === 'string' && data ? data : null;
  }

  if (Array.isArray(data.details) && data.details.length > 0) {
    return data.details
      .map((detail) => `${detail.champ} : ${detail.message}`)
      .join(' · ');
  }

  return data.erreur || data.message || null;
}

async function requete(chemin, options = {}) {
  const token = getToken();
  const headers = { ...options.headers };

  if (options.body != null && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let reponse;

  try {
    reponse = await fetch(`${BASE_URL}${chemin}`, {
      ...options,
      headers,
      body: preparerBody(options.body),
    });
  } catch {
    throw new Error(
      `Impossible de joindre le serveur. Vérifie ta connexion et que l'API (${BASE_URL}) est bien démarrée.`,
    );
  }

  const data = await lireReponse(reponse);

  // Le token est expiré ou révoqué : on vide la session et on renvoie
  // l'utilisateur vers la page de connexion.
  if (reponse.status === 401 && token) {
    viderSessionLocale();

    if (window.location.pathname !== '/login') {
      window.location.replace('/login');
    }

    throw new Error('Session expirée, reconnectez-vous.');
  }

  if (!reponse.ok) {
    throw new Error(messageErreur(data) || 'Une erreur est survenue.');
  }

  return data;
}

export const apiClient = {
  get: (chemin) => requete(chemin, { method: 'GET' }),
  post: (chemin, body) => requete(chemin, { method: 'POST', body }),
  patch: (chemin, body) => requete(chemin, { method: 'PATCH', body }),
  delete: (chemin) => requete(chemin, { method: 'DELETE' }),
};
