// Test du système de correspondance floue
const { isTextAnswerCorrect, normalizeText, tokenize, jaccardSimilarity, filterTokens } = require('./lib/fuzzy-matching.ts');

// Test avec l'exemple donné par l'utilisateur
const correctAnswer = "Connecté l'ASAP (sur la corde de sécurité), puis connectés croll , poignée (sur la corde de travail";
const userAnswer = "Asap sur la corde de securité. Croll et la poignée sur la corde de travail.";

console.log("=== TEST DU SYSTÈME DE CORRESPONDANCE FLOUE ===\n");

console.log("Réponse correcte:", correctAnswer);
console.log("Réponse utilisateur:", userAnswer);
console.log();

// Test de normalisation
console.log("--- NORMALISATION ---");
console.log("Correct normalisé:", normalizeText(correctAnswer));
console.log("User normalisé:", normalizeText(userAnswer));
console.log();

// Test de tokenisation
console.log("--- TOKENISATION ---");
const correctTokens = tokenize(correctAnswer);
const userTokens = tokenize(userAnswer);
console.log("Tokens corrects:", correctTokens);
console.log("Tokens utilisateur:", userTokens);
console.log();

// Test de filtrage des mots vides
console.log("--- FILTRAGE DES MOTS VIDES ---");
const filteredCorrect = filterTokens(correctTokens);
const filteredUser = filterTokens(userTokens);
console.log("Tokens corrects filtrés:", filteredCorrect);
console.log("Tokens utilisateur filtrés:", filteredUser);
console.log();

// Test de similarité
console.log("--- SIMILARITÉ ---");
const similarity = jaccardSimilarity(filteredUser, filteredCorrect);
console.log("Similarité Jaccard:", similarity.toFixed(3));

// Calcul du pourcentage de mots-clés trouvés
const keywordHit = filteredCorrect.filter(token => filteredUser.includes(token)).length / filteredCorrect.length;
console.log("Mots-clés trouvés:", keywordHit.toFixed(3), `(${Math.round(keywordHit * 100)}%)`);
console.log();

// Test final
console.log("--- RÉSULTAT FINAL ---");
const isCorrect = isTextAnswerCorrect(userAnswer, correctAnswer);
console.log("La réponse est-elle correcte?", isCorrect ? "✅ OUI" : "❌ NON");

// Tests supplémentaires
console.log("\n=== TESTS SUPPLÉMENTAIRES ===\n");

const testCases = [
  {
    correct: "ASAP sur corde de sécurité",
    user: "asap sur la corde de securite",
    expected: true
  },
  {
    correct: "Croll et poignée sur corde de travail",
    user: "croll et poignee sur corde travail",
    expected: true
  },
  {
    correct: "Vérifier l'équipement avant utilisation",
    user: "verifier equipement avant utilisation",
    expected: true
  },
  {
    correct: "Porter un casque de sécurité",
    user: "utiliser des gants de protection",
    expected: false
  }
];

testCases.forEach((test, index) => {
  const result = isTextAnswerCorrect(test.user, test.correct);
  const status = result === test.expected ? "✅ PASS" : "❌ FAIL";
  console.log(`Test ${index + 1}: ${status}`);
  console.log(`  Correct: "${test.correct}"`);
  console.log(`  User: "${test.user}"`);
  console.log(`  Résultat: ${result}, Attendu: ${test.expected}`);
  console.log();
});
