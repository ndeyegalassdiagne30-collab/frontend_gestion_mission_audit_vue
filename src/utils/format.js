// Sépare le champ "date_action" du journal (format "AAAA-MM-JJ HH:MM" ou ISO)
// en une date et une heure distinctes, affichées dans deux colonnes.
export function splitDateHeure(dateAction) {
  const valeur = String(dateAction || '');

  if (valeur.includes('T')) {
    return { date: valeur.slice(0, 10), heure: valeur.slice(11, 16) || '-' };
  }

  const [date, heure] = valeur.split(' ');

  return { date: date || '-', heure: heure || '-' };
}

// Date du jour au format attendu par l'API (AAAA-MM-JJ)
export function aujourdhui() {
  return new Date().toISOString().slice(0, 10);
}

// Initiales affichées quand un utilisateur n'a pas de photo
export function initiales(utilisateur) {
  const valeur = `${utilisateur?.prenom?.[0] || ''}${utilisateur?.nom?.[0] || ''}`;

  return valeur.toUpperCase();
}

// Une photo n'est affichable que si l'API a bien renvoyé une URL Cloudinary
export function aUnePhoto(utilisateur) {
  return typeof utilisateur?.photo === 'string' && utilisateur.photo.startsWith('http');
}
