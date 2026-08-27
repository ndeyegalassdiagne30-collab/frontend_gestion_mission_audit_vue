// Compare deux ids en ignorant leur type : l'API renvoie des nombres (1, 2...)
// alors que les <select>/<input> HTML renvoient toujours des chaînes de
// caractères ("1", "2..."). Sans ça, une mission fraîchement choisie dans un
// formulaire ne retrouverait plus son client / expert / auditeur.
export function sameId(a, b) {
  return String(a) === String(b);
}
