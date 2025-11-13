// src/components/GameBoard.tsx

// Ce composant affiche uniquement la grille du jeu (sans gérer la logique).
// Il reçoit la grille en props et se contente de l'afficher avec les bonnes couleurs.

import type { Cell } from "../types/game";

type GameBoardProps = {
  grid: Cell[][];
};

export function GameBoard({ grid }: GameBoardProps) {
  return (
    <div className="space-y-2 mb-4">
      {grid.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-1 justify-center">
          {row.map((cell, colIndex) => (
            <div
              key={colIndex}
              className={`
                w-10 h-10 rounded-sm flex items-center justify-center text-xl font-bold
                border
                ${
                  cell.state === "correct"
                    // Rouge = lettre bien placée
                    ? "bg-red-600 border-red-600 text-white"
                    : cell.state === "present"
                    // Jaune = lettre présente mais mal placée
                    ? "bg-yellow-400 border-yellow-400 text-black"
                    : cell.state === "absent"
                    // Bleu = lettre absente (dans la grille, pas le clavier)
                    ? "bg-blue-700 border-blue-700 text-white"
                    // Case vide (non encore jouée)
                    : "border-blue-700 bg-neutral-800 text-white"
                }
              `}
            >
              {cell.letter}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}