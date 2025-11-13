// src/types/game.ts

// État possible d'une case / d'une lettre
export type CellState = "empty" | "correct" | "present" | "absent";

// Représente une case de la grille (lettre + état pour la couleur)
export type Cell = {
  letter: string;
  state: CellState;
};