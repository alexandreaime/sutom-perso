"use client";

type CellState = "empty" | "correct" | "present" | "absent";
type Cell = { letter: string; state: CellState };

type GameBoardProps = {
  grid: Cell[][];
  // index de la ligne récemment validée (pour l’animation lettre par lettre)
  animateRowIndex: number | null;
  // index de la ligne active
  currentAttempt: number;
  // lettres connues comme correctes par position
  knownCorrect: (string | null)[];
  // saisie actuelle (mot complet tapé)
  currentInput: string;
  // pour ne plus afficher de ligne active une fois terminé
  gameOver: boolean;
  // true pendant la révélation des couleurs
  isRevealing: boolean;
};

/**
 * Grille principale du jeu.
 * - Les lignes < currentAttempt : essais déjà joués (couleurs "figées")
 * - La ligne == currentAttempt : ligne active (lettres tapées + lettres trouvées + points)
 *   -> sauf pendant la révélation : aucune ligne active, on montre seulement les couleurs
 * - Les lignes > currentAttempt : vides
 */
export function GameBoard({
  grid,
  animateRowIndex,
  currentAttempt,
  knownCorrect,
  currentInput,
  gameOver,
  isRevealing,
}: GameBoardProps) {
  return (
    <div className="space-y-2 mb-4">
      {grid.map((row, rowIndex) => {
        // 👉 Ligne active uniquement si pas de gameOver ET pas en train de révéler
        const isActive = rowIndex === currentAttempt && !gameOver && !isRevealing;

        // Pour la ligne active, on veut un comportement spécial :
        // - si le premier caractère saisi est exactement la première lettre connue,
        //   on ne le place pas en 2e cellule (c’est juste un "doublon" visuel).
        let effectiveInput = currentInput;
        if (
          isActive &&
          effectiveInput.length > 0 &&
          knownCorrect[0] &&
          effectiveInput[0] === knownCorrect[0]
        ) {
          effectiveInput = effectiveInput.slice(1);
        }

        return (
          <div key={rowIndex} className="flex gap-2 justify-center">
            {row.map((cell, colIndex) => {
              let displayLetter = "";
              let displayState: CellState = cell.state;
              let isPlaceholderDot = false;

              if (isActive) {
                // Ligne active : pas de couleurs, juste lettres + points
                if (colIndex === 0 && knownCorrect[0]) {
                  displayLetter = knownCorrect[0];
                } else if (colIndex > 0 && colIndex - 1 < effectiveInput.length) {
                  displayLetter = effectiveInput[colIndex - 1];
                } else if (knownCorrect[colIndex]) {
                  displayLetter = knownCorrect[colIndex] as string;
                } else {
                  displayLetter = "·";
                  isPlaceholderDot = true;
                }

                displayState = "empty";
              } else {
                // Lignes non actives : on affiche la grille telle qu'elle est (avec couleurs)
                displayLetter = cell.letter;
              }

              const isFilledWithColor =
                displayState === "correct" ||
                displayState === "present" ||
                displayState === "absent";
              const shouldAnimate =
                isFilledWithColor && animateRowIndex === rowIndex;

              // Couleurs de fond + bordures
              let bgAndBorderClass = "";
              if (displayState === "correct") {
                bgAndBorderClass = "bg-red-600 border-red-600 text-white";
              } else if (displayState === "present") {
                // Fond bleu + cercle jaune par-dessus
                bgAndBorderClass = "bg-blue-700 border-blue-700 text-white";
              } else if (displayState === "absent") {
                bgAndBorderClass = "bg-blue-700 border-blue-700 text-white";
              } else {
                bgAndBorderClass = "bg-neutral-800 border-blue-700 text-white";
              }

              if (isPlaceholderDot) {
                bgAndBorderClass = bgAndBorderClass.replace(
                  "text-white",
                  "text-neutral-500"
                );
              }

              return (
                <div
                  key={colIndex}
                  className={`
                    relative
                    w-12 h-12 sm:w-14 sm:h-14 rounded-md flex items-center justify-center
                    font-bold text-lg sm:text-2xl border-2
                    ${bgAndBorderClass}
                    ${shouldAnimate ? "cell-pop" : ""}
                  `}
                >
                  {/* Rond jaune "présent" qui touche le bord de la cellule (style Motus) */}
                  {displayState === "present" && (
                    <div className="absolute inset-[2px] sm:inset-[3px] rounded-full bg-yellow-400" />
                  )}

                  <span className="relative z-10">{displayLetter}</span>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}