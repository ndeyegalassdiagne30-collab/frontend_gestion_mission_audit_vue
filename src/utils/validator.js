// Vérifie qu'une chaîne respecte un format d'email valide
export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value ?? '').trim());
}

// Vérifie qu'un numéro de téléphone contient exactement 9 chiffres

export function isPhone(value) {
  return /^\d{9}$/.test(String(value ?? '').trim());
}
