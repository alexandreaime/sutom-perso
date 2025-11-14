// src/config/words.ts

// 📝 Liste des mots du jour.
// Règles conseillées :
// - uniquement des lettres A-Z (pas d'accents, pas de tirets),
// - tous en MAJUSCULES,
// - l'ordre de ce tableau = l'ordre chronologique utilisé par le jeu.
//   jour 0  -> WORD_LIST[0]
//   jour 1  -> WORD_LIST[1]
//   ...
//   et on boucle quand on arrive à la fin.
//
// ➜ La longueur des mots PEUT varier (3, 5, 8 lettres...), le front s'adapte.
export const WORD_LIST: string[] = [
  "PYTHON",
  "LIMACE",
  "PIMENT",
  "TIGRE",
  "ORANGES",
  "CAMION",
  "BUS",
  "PROGRAMMEUR",
  // ➜ remplace tout ça par ta vraie liste, dans l'ordre
];

// 📅 Date de départ : jour 0 = WORD_LIST[0]
// Le mot du jour est choisi en fonction du nombre de jours écoulés depuis cette date.
// Exemple : si tu lances le jeu au travail le 1er décembre 2025, tu peux mettre :
export const START_DATE = new Date("2025-11-01T00:00:00+01:00");

// 🔍 Petit garde-fou minimal : on vérifie qu'il y a au moins 1 mot.
if (WORD_LIST.length === 0) {
  throw new Error(
    "[config/words] WORD_LIST est vide. Ajoute au moins un mot pour que le jeu fonctionne."
  );
}