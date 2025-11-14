"use client";

type CellState = "empty" | "correct" | "present" | "absent";

type KeyboardProps = {
  // Layout du clavier, par lignes
  keyRows: string[][];
  // État de chaque lettre (A-Z)
  keyStates: Record<string, CellState>;
  // True si la partie est finie (désactive le clavier)
  disabled: boolean;
  // Callback pour gérer les clics sur les touches
  onKeyClick: (key: string) => void;
};

/**
 * Clavier virtuel AZERTY.
 *
 * - Bordures blanches par défaut
 * - Bordure grise quand la lettre est grisée (absente)
 * - Coloration en fonction de l'état des lettres
 */
export function Keyboard({ keyRows, keyStates, disabled, onKeyClick }: KeyboardProps) {
  function getKeyClassName(key: string): string {
    const baseClasses =
      "flex-1 min-w-[2.4rem] sm:min-w-[2.7rem] px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base font-semibold rounded-md border-2 text-center";

    if (key === "ENTER" || key === "BACKSPACE") {
      // Touche fonction : bordure blanche
      return baseClasses + " bg-neutral-600 border-white text-white";
    }

    const state: CellState = keyStates[key] ?? "empty";

    if (state === "correct") {
      return baseClasses + " bg-red-600 border-white text-white";
    }

    if (state === "present") {
      return baseClasses + " bg-yellow-400 border-white text-white";
    }

    if (state === "absent") {
      // Lettre absente → fond gris + bordure grise + texte grisé
      return baseClasses + " bg-neutral-700 border-neutral-500 text-neutral-400";
    }

    // empty : touche jamais utilisée → fond gris + bordure blanche
    return baseClasses + " bg-neutral-700 border-white text-white";
  }

  return (
    <div className="space-y-2" aria-label="Clavier virtuel" role="group">
      {keyRows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-1 justify-center">
          {row.map((key) => {
            const label =
              key === "BACKSPACE"
                ? "Effacer une lettre"
                : key === "ENTER"
                ? "Valider le mot"
                : `Lettre ${key}`;

            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  if (!disabled) onKeyClick(key);
                }}
                disabled={disabled}
                className={
                  getKeyClassName(key) +
                  " disabled:opacity-50 disabled:cursor-default"
                }
                aria-label={label}
              >
                {key === "BACKSPACE" ? "⌫" : key === "ENTER" ? "↵" : key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}