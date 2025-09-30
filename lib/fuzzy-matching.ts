// Fonction utilitaire pour le matching flou des réponses
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '') // Supprimer les accents
    .replace(/[^a-z0-9\s]/g, ' ') // Garder seulement lettres, chiffres et espaces
    .replace(/\s+/g, ' ') // Remplacer les espaces multiples par un seul
    .trim();
}

export function tokenize(text: string): string[] {
  return normalizeText(text).split(' ').filter(Boolean);
}

export function jaccardSimilarity(tokens1: string[], tokens2: string[]): number {
  if (tokens1.length === 0 && tokens2.length === 0) return 1;
  if (tokens1.length === 0 || tokens2.length === 0) return 0;
  
  const set1 = new Set(tokens1);
  const set2 = new Set(tokens2);
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
}

// Mots vides français à ignorer
const STOPWORDS = new Set([
  'le', 'la', 'les', 'de', 'des', 'du', 'un', 'une', 'et', 'ou', 'au', 'aux',
  'pour', 'par', 'dans', 'sur', 'avec', 'sans', 'en', 'a', 'd', 'l', 'que',
  'qui', 'quoi', 'dont', 'est', 'sont', 'etre', 'cette', 'ce', 'ces',
  'mon', 'ma', 'mes', 'ton', 'ta', 'tes', 'son', 'sa', 'ses'
]);

export function filterTokens(tokens: string[]): string[] {
  return tokens.filter(token => 
    !STOPWORDS.has(token) && token.length >= 2
  );
}

export function isTextAnswerCorrect(userAnswer: string, correctAnswer: string): boolean {
  if (!userAnswer || !correctAnswer) return false;
  
  // Test exact d'abord
  if (normalizeText(userAnswer) === normalizeText(correctAnswer)) {
    return true;
  }
  
  // Test de similarité par tokens
  const userTokens = filterTokens(tokenize(userAnswer));
  const correctTokens = filterTokens(tokenize(correctAnswer));
  
  if (userTokens.length === 0 || correctTokens.length === 0) {
    return false;
  }
  
  const similarity = jaccardSimilarity(userTokens, correctTokens);
  const keywordHit = correctTokens.filter(token => 
    userTokens.includes(token)
  ).length / correctTokens.length;
  
  // Accepter si similarité >= 60% ou si au moins 50% des mots-clés sont présents
  return similarity >= 0.6 || keywordHit >= 0.5;
}

export function isNumberAnswerCorrect(userAnswer: number | string, correctAnswer: number | string): boolean {
  const userNum = Number(userAnswer);
  const correctNum = Number(correctAnswer);
  
  if (Number.isNaN(userNum) || Number.isNaN(correctNum)) {
    return false;
  }
  
  // Tolérance : 1% de la valeur correcte ou 0.01 minimum
  const tolerance = Math.max(Math.abs(correctNum) * 0.01, 0.01);
  return Math.abs(userNum - correctNum) <= tolerance;
}



















