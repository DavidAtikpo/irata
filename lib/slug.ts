/**
 * Fonction pour générer un slug URL-friendly à partir d'une référence interne
 * Exemple: "CI.AN 070 à 078" -> "ci-an-070-a-078"
 */
export function generateSlugFromReference(referenceInterne: string): string {
  if (!referenceInterne) return '';
  
  return referenceInterne
    .toLowerCase()
    // Remplacer les caractères spéciaux par des tirets
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ç]/g, 'c')
    .replace(/[ñ]/g, 'n')
    // Remplacer les espaces et caractères spéciaux par des tirets
    .replace(/[^a-z0-9]+/g, '-')
    // Supprimer les tirets en début et fin
    .replace(/^-+|-+$/g, '')
    // Limiter la longueur
    .substring(0, 100);
}

