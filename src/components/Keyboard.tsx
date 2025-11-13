"use client";

// On redéclare le type localement : c'est le même union que dans page.tsx.
// TypeScript est structurel : même définition = compatible.
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
 * - Affiche des touches en plusieurs lignes
 * - Coloration en fonction de l'état des lettres (correct / present / absent / empty)
 * - Propulse les événements vers le parent via onKeyClick
 */
export function Keyboard({ keyRows, keyStates, disabled, onKeyClick }: KeyboardProps) {
  // Style des touches en fonction de leur état
  function getKeyClassName(key: string): string {
    const baseClasses =
      "flex-1 min-w-[2.2rem] px-2 py-2 text-sm font-semibold rounded-md border text-center";

    // Cas spéciaux : ENTER / BACKSPACE
    if (key === "ENTER" || key === "BACKSPACE") {
      return baseClasses + " bg-neutral-600 border-neutral-700 text-white";
    }

    const state: CellState = keyStates[key] ?? "empty";

    if (state === "correct") {
      // Rouge comme sur SUTOM
      return baseClasses + " bg-red-600 border-red-600 text-white";
    }

    if (state === "present") {
      // Jaune
      return baseClasses + " bg-yellow-400 border-yellow-400 text-black";
    }

    if (state === "absent") {
      // Lettre absente → gris foncé + texte gris (comme SUTOM)
      return baseClasses + " bg-neutral-700 border-neutral-800 text-neutral-400";
    }

    // empty : touche jamais utilisée
    return baseClasses + " bg-neutral-700 border-neutral-800 text-white";
  }

  return (
    <div className="space-y-2">
      {keyRows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-1 justify-center">
          {row.map((key) => (
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
            >
              {key === "BACKSPACE" ? "⌫" : key === "ENTER" ? "↵" : key}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}