"use client";

import { useState } from "react";
import { getWordOfTheDay } from "../lib/getWordOfTheDay";

export default function HomePage() {
  //
  // === MOT DU JOUR ===
  //
  // On récupère ici :
  // - "word" : le mot du jour (ex: "PYTHON")
  //
  const { word } = getWordOfTheDay();

  //
  // === CONFIG DU JEU ===
  //
  const MAX_ATTEMPTS = 6; // nombre de lignes / essais

  //
  // === TYPES POUR LA GRILLE ===
  //
  // Chaque case de la grille contient : une lettre + un état (pour la couleur)
  type CellState = "empty" | "correct" | "present" | "absent";
  type Cell = { letter: string; state: CellState };

  //
  // === LAYOUT DU CLAVIER (AZERTY) ===
  //
  const KEY_ROWS: string[][] = [
    ["A", "Z", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["Q", "S", "D", "F", "G", "H", "J", "K", "L", "M"],
    ["ENTER", "W", "X", "C", "V", "B", "N", "BACKSPACE"],
  ];

  //
  // === ÉTATS DU JEU ===
  //

  // 1) La grille : tableau 2D de cases
  // grid[0] = première ligne (essai 1)
  // grid[0][2] = case en colonne 3 de la ligne 1
  const [grid, setGrid] = useState<Cell[][]>(
    Array.from({ length: MAX_ATTEMPTS }, () =>
      Array.from({ length: word.length }, () => ({ letter: "", state: "empty" }))
    )
  );

  // 2) La ligne active (0 = première ligne, 1 = deuxième...)
  const [currentAttempt, setCurrentAttempt] = useState(0);

  // 3) L’input dans lequel l’utilisateur tape une proposition
  const [currentInput, setCurrentInput] = useState("");

  // 4) Savoir si la partie est finie (gagné ou perdu)
  const [gameOver, setGameOver] = useState(false);

  // 5) Savoir si le joueur a gagné
  const [hasWon, setHasWon] = useState(false);

  // 6) Message affiché sous la grille (victoire / défaite / info)
  const [statusMessage, setStatusMessage] = useState("");

  // 7) État des touches du clavier virtuel (par lettre)
  // On stocke pour chaque lettre son "meilleur" état déjà vu : correct > present > absent > empty
  const [keyStates, setKeyStates] = useState<Record<string, CellState>>({});

  //
  // === FONCTION UTILITAIRE : prioriser les états des touches ===
  //
  // Si une lettre a déjà été vue "correct", on ne veut pas la repasser en "present" ou "absent", etc.
  function mergeKeyState(previous: CellState | undefined, next: CellState): CellState {
    const priority: Record<CellState, number> = {
      correct: 3,
      present: 2,
      absent: 1,
      empty: 0,
    };

    if (!previous) return next;
    return priority[next] > priority[previous] ? next : previous;
  }

  //
  // === LOGIQUE : quand l'utilisateur valide son mot ===
  //
  function handleSubmit() {
    // Si la partie est déjà finie, on ne fait rien
    if (gameOver) return;

    const guess = currentInput.trim().toUpperCase();

    // Vérification simple : la longueur doit être exacte
    if (guess.length !== word.length) {
      alert(`Le mot doit faire ${word.length} lettres.`);
      return;
    }

    // On crée une copie "propre" de la grille (React ne doit PAS muter directement)
    const newGrid = [...grid];

    // On veut calculer les états :
    // 1) correct (bien placé)
    // 2) present (présent mais mal placé)
    // 3) absent (pas dans le mot)
    const guessLetters = guess.split("");
    const secretLetters = word.split("");

    // Résultat initial : tout est absent
    const result: CellState[] = Array(word.length).fill("absent");

    // --- Étape 1 : correct (lettres parfaitement placées) ---
    for (let i = 0; i < word.length; i++) {
      if (guessLetters[i] === secretLetters[i]) {
        result[i] = "correct";
        secretLetters[i] = ""; // on "retire" cette lettre du secret
      }
    }

    // --- Étape 2 : present (lettres présentes mais mal placées) ---
    for (let i = 0; i < word.length; i++) {
      if (result[i] === "correct") continue;

      const letter = guessLetters[i];
      const idx = secretLetters.indexOf(letter);

      if (idx !== -1) {
        result[i] = "present";
        secretLetters[idx] = ""; // on consomme la lettre
      }
    }

    // --- Remplir la ligne dans la grille avec lettres + états ---
    for (let i = 0; i < word.length; i++) {
      newGrid[currentAttempt][i] = {
        letter: guessLetters[i],
        state: result[i],
      };
    }

    // Met à jour l’état React de la grille
    setGrid(newGrid);

    // --- Mettre à jour les états des touches du clavier ---
    const newKeyStates: Record<string, CellState> = { ...keyStates };
    for (let i = 0; i < word.length; i++) {
      const letter = guessLetters[i];
      const state = result[i];
      // On ignore les cases "empty" (normalement il n'y en a pas ici)
      if (state === "empty") continue;
      newKeyStates[letter] = mergeKeyState(newKeyStates[letter], state);
    }
    setKeyStates(newKeyStates);

    // Vérifier si le joueur a trouvé le mot
    const isCorrectWord = guess === word;

    if (isCorrectWord) {
      setHasWon(true);
      setGameOver(true);
      setStatusMessage(`Bravo ! Tu as trouvé le mot du jour 🎉`);
      setCurrentInput("");
      return;
    }

    // Si ce n'est pas trouvé et qu'on a utilisé la dernière tentative -> perdu
    if (currentAttempt + 1 >= MAX_ATTEMPTS) {
      setHasWon(false);
      setGameOver(true);
      setStatusMessage(`C'est raté ! Le mot du jour était : ${word}.`);
      setCurrentInput("");
      return;
    }

    // Sinon, on passe à l'essai suivant
    setCurrentAttempt(currentAttempt + 1);
    setCurrentInput("");
    setStatusMessage("");
  }

  //
  // === LOGIQUE : gestion des clics sur le clavier virtuel ===
  //
  function handleKeyClick(key: string) {
    if (gameOver) return;

    if (key === "ENTER") {
      handleSubmit();
      return;
    }

    if (key === "BACKSPACE") {
      setCurrentInput((prev) => prev.slice(0, -1));
      return;
    }

    // Lettre normale
    if (currentInput.length >= word.length) return; // on ne dépasse pas la longueur du mot
    setCurrentInput((prev) => (prev + key).toUpperCase());
  }

  //
  // === STYLE DES TOUCHES DU CLAVIER EN FONCTION DE LEUR ÉTAT ===
  //
  function getKeyClassName(key: string): string {
    // Cas spéciaux : ENTER / BACKSPACE (touches de fonction)
    const baseClasses =
      "flex-1 min-w-[2.2rem] px-2 py-2 text-sm font-semibold rounded-md border text-center";

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

  //
  // === RENDER (affichage) ===
  //
  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-900 text-slate-100">
      <div className="w-full max-w-md mx-4 rounded-2xl bg-neutral-800 border border-neutral-700 shadow-xl p-6">
        {/* Titre */}
        <h1 className="text-2xl font-bold text-center mb-1">SUTOM perso</h1>
        <p className="text-sm text-slate-300 text-center">
          Devine le mot du jour en 6 essais
        </p>
        {/* Règles rapides */}
        <p className="text-xs text-slate-400 text-center mb-4">
          Rouge : lettre bien placée · Jaune : lettre présente · Gris : lettre absente
        </p>

        {/* ==== Message de statut (victoire / défaite) ==== */}
        <div className="min-h-[1.5rem] mb-4 text-center text-sm">
          {statusMessage && (
            <span className={hasWon ? "text-emerald-400" : "text-rose-300"}>
              {statusMessage}
            </span>
          )}
        </div>

        {/* ==== Grille du jeu ==== */}
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
                        // Bleu/gris = lettre absente
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

        {/* ==== Saisie du mot ==== */}
        <form
          className="mt-2 mb-4 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <input
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value.toUpperCase())}
            maxLength={word.length}
            disabled={gameOver}
            className="flex-1 px-3 py-2 rounded-lg bg-neutral-700 border border-neutral-600 text-slate-100 text-lg tracking-widest text-center disabled:opacity-50"
            placeholder={
              gameOver ? "Partie terminée" : `Mot de ${word.length} lettres`
            }
          />

          <button
            type="submit"
            disabled={gameOver}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold disabled:opacity-50"
          >
            OK
          </button>
        </form>

        {/* ==== Clavier virtuel AZERTY ==== */}
        <div className="space-y-2">
          {KEY_ROWS.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-1 justify-center">
              {row.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleKeyClick(key)}
                  disabled={gameOver}
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
      </div>
    </main>
  );
}