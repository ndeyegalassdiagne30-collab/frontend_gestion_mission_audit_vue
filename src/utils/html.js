// Échappe les caractères HTML spéciaux.
// Vue échappe déjà tout ce qui passe par {{ }} : cette fonction ne sert que
// pour les rares messages de confirmation qui contiennent du gras (v-html),
// afin qu'une raison sociale ou un titre de mission ne puisse pas injecter
// de balises.
export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
