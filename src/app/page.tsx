"use client";

import { useState, useEffect, useRef } from "react";
import { getWordOfTheDay, getDayIndex } from "../lib/getWordOfTheDay";
import { GameBoard } from "../components/GameBoard";
import { Keyboard } from "../components/Keyboard";
import { StatusBar } from "../components/StatusBar";

// Types internes pour la logique du jeu
type CellState = "empty" | "correct" | "present" | "absent";
type Cell = { letter: string; state: CellState };

export default function HomePage() {
  //
  // === MOT DU JOUR & IDENTIFIANT DU JOUR ===
  //
  const { word } = getWordOfTheDay();
  const dayIndex = getDayIndex();
  const STORAGE_KEY = `sutom-game-${dayIndex}`;

  // Date affichée dans le header
  const today = new Date();
  const formattedDate = today.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  //
  // === CONFIG DU JEU ===
  //
  const MAX_ATTEMPTS = 6;

  //
  // === ÉTATS DU JEU ===
  //

  // 1) Grille : contiendra les lignes déjà jouées (lettres + états)
  const [grid, setGrid] = useState<Cell[][]>(() =>
    Array.from({ length: MAX_ATTEMPTS }, () =>
      Array.from({ length: word.length }, () => ({ letter: "", state: "empty" }))
    )
  );

  // 2) Ligne active
  const [currentAttempt, setCurrentAttempt] = useState(0);

  // 3) Saisie actuelle (mot complet tapé par l'utilisateur)
  const [currentInput, setCurrentInput] = useState("");

  // 4) Fin de partie
  const [gameOver, setGameOver] = useState(false);

  // 5) Victoire ?
  const [hasWon, setHasWon] = useState(false);

  // 6) Message affiché (victoire / défaite)
  const [statusMessage, setStatusMessage] = useState("");

  // 7) État des touches du clavier
  const [keyStates, setKeyStates] = useState<Record<string, CellState>>({});

  // 8) Ligne récemment validée (pour l’animation lettre par lettre)
  const [lastSubmittedRow, setLastSubmittedRow] = useState<number | null>(null);

  // 9) Lettres connues comme correctes par position (pour les montrer en bleu dans la ligne active)
  const [knownCorrect, setKnownCorrect] = useState<(string | null)[]>(() => {
    const arr = Array(word.length).fill(null) as (string | null)[];
    // Première lettre connue dès le départ
    arr[0] = word[0];
    return arr;
  });

  // 10) Affichage du popup "Règles"
  const [showRules, setShowRules] = useState(false);

  // 11) Référence vers l’input pour le focus
  const inputRef = useRef<HTMLInputElement | null>(null);

  // 12) Animation en cours ? (révélation des couleurs lettre par lettre)
  const [isRevealing, setIsRevealing] = useState(false);

  // 13) Feedback visuel pour le partage
  const [shareCopied, setShareCopied] = useState(false);

  //
  // === PERSISTENCE LOCALE : RECHARGER LA PARTIE DU JOUR SI ELLE EXISTE ===
  //
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const saved = JSON.parse(raw) as {
        word: string;
        grid: Cell[][];
        currentAttempt: number;
        currentInput: string;
        gameOver: boolean;
        hasWon: boolean;
        statusMessage: string;
        keyStates: Record<string, CellState>;
        lastSubmittedRow: number | null;
        knownCorrect: (string | null)[];
      };

      if (saved.word !== word) {
        return;
      }

      setGrid(saved.grid);
      setCurrentAttempt(saved.currentAttempt ?? 0);
      setCurrentInput(saved.currentInput ?? "");
      setGameOver(saved.gameOver ?? false);
      setHasWon(saved.hasWon ?? false);
      setStatusMessage(saved.statusMessage ?? "");
      setKeyStates(saved.keyStates ?? {});
      setLastSubmittedRow(saved.lastSubmittedRow ?? null);

      if (saved.knownCorrect && Array.isArray(saved.knownCorrect)) {
        setKnownCorrect(saved.knownCorrect);
      }
    } catch (err) {
      console.error("[SUTOM] Erreur lors du chargement de la partie :", err);
    }
  }, [STORAGE_KEY, word]);

  //
  // === PERSISTENCE LOCALE : SAUVEGARDER À CHAQUE CHANGEMENT D'ÉTAT ===
  //
  useEffect(() => {
    if (typeof window === "undefined") return;

    const payload = {
      word,
      grid,
      currentAttempt,
      currentInput,
      gameOver,
      hasWon,
      statusMessage,
      keyStates,
      lastSubmittedRow,
      knownCorrect,
    };

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (err) {
      console.error("[SUTOM] Erreur lors de l'enregistrement de la partie :", err);
    }
  }, [
    STORAGE_KEY,
    word,
    grid,
    currentAttempt,
    currentInput,
    gameOver,
    hasWon,
    statusMessage,
    keyStates,
    lastSubmittedRow,
    knownCorrect,
  ]);

  //
  // === FOCUS SUR L'INPUT QUAND C'EST POSSIBLE ===
  //
  useEffect(() => {
    if (!gameOver) {
      inputRef.current?.focus();
    }
  }, [gameOver]);

  //
  // === FONCTION UTILITAIRE : prioriser les états des touches ===
  //
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
    if (gameOver || isRevealing) return;

    const trimmed = currentInput.trim().toUpperCase();
    const expectedLength = word.length;

    // 1) Longueur exacte
    if (trimmed.length !== expectedLength) {
      alert(`Le mot doit faire ${word.length} lettres`);
      return;
    }

    // 2) Le mot doit commencer par la première lettre révélée
    if (trimmed[0] !== word[0]) {
      alert(`Le mot doit commencer par la lettre "${word[0]}"`);
      return;
    }

    const guess = trimmed;
    const guessLetters = guess.split("");
    const secretLetters = word.split("");

    const result: CellState[] = Array(word.length).fill("absent");

    // Étape 1 : correct
    for (let i = 0; i < word.length; i++) {
      if (guessLetters[i] === secretLetters[i]) {
        result[i] = "correct";
        secretLetters[i] = "";
      }
    }

    // Étape 2 : present
    for (let i = 0; i < word.length; i++) {
      if (result[i] === "correct") continue;
      const letter = guessLetters[i];
      const idx = secretLetters.indexOf(letter);
      if (idx !== -1) {
        result[i] = "present";
        secretLetters[idx] = "";
      }
    }

    const attemptIndex = currentAttempt;

    // Màj des lettres connues comme correctes
    setKnownCorrect((prev) => {
      const next = [...prev];
      for (let i = 0; i < word.length; i++) {
        if (result[i] === "correct") {
          next[i] = word[i];
        }
      }
      return next;
    });

    // Clone de la grille
    const newGrid: Cell[][] = grid.map((row) =>
      row.map((cell) => ({ ...cell }))
    );

    // Remplir la ligne jouée :
    // - case 0 : toujours la 1ère lettre du mot
    // - autres cases : lettres tapées, couleur révélée plus tard
    for (let i = 0; i < word.length; i++) {
      if (i === 0) {
        newGrid[attemptIndex][i] = {
          letter: word[0],
          state: "correct",
        };
      } else {
        newGrid[attemptIndex][i] = {
          letter: guessLetters[i],
          state: "empty",
        };
      }
    }

    setGrid(newGrid);
    setLastSubmittedRow(attemptIndex);
    setIsRevealing(true);

    // Màj clavier
    const newKeyStates: Record<string, CellState> = { ...keyStates };
    for (let i = 0; i < word.length; i++) {
      const letter = guessLetters[i];
      const state = result[i];
      if (state === "empty") continue;
      newKeyStates[letter] = mergeKeyState(newKeyStates[letter], state);
    }
    setKeyStates(newKeyStates);

    const isCorrectWord = guess === word;
    const isLastAttempt = attemptIndex + 1 >= MAX_ATTEMPTS;

    if (isCorrectWord) {
      setHasWon(true);
      setGameOver(true);
      setStatusMessage(`Bravo ! Tu as trouvé le mot du jour 🎉`);
      setCurrentInput("");
    } else if (isLastAttempt) {
      setHasWon(false);
      setGameOver(true);
      setStatusMessage(`C'est raté ! Le mot du jour était : ${word}.`);
      setCurrentInput("");
    }

    // Révélation progressive des couleurs à partir de la 2e lettre
    for (let i = 1; i < word.length; i++) {
      setTimeout(() => {
        setGrid((prev) => {
          const copy = prev.map((row) => row.map((cell) => ({ ...cell })));
          copy[attemptIndex][i].state = result[i];
          return copy;
        });

        // Quand la dernière lettre est révélée, on termine l'animation
        if (i === word.length - 1) {
          setIsRevealing(false);

          // Si la partie continue, on ne passe à la ligne suivante
          // QU'UNE FOIS que toutes les couleurs sont révélées
          if (!isCorrectWord && !isLastAttempt) {
            setCurrentAttempt(attemptIndex + 1);
            setCurrentInput("");
            setStatusMessage("");
            inputRef.current?.focus();
          }
        }
      }, i * 350);
    }
  }

  //
  // === LOGIQUE : gestion des clics sur le clavier virtuel ===
  //
  function handleKeyClick(key: string) {
    if (gameOver || isRevealing) return;

    if (key === "ENTER") {
      handleSubmit();
      return;
    }

    if (key === "BACKSPACE") {
      setCurrentInput((prev) => prev.slice(0, -1));
      inputRef.current?.focus();
      return;
    }

    const maxLen = word.length;
    if (currentInput.length >= maxLen) return;

    setCurrentInput((prev) => (prev + key).toUpperCase());
    inputRef.current?.focus();
  }

  //
  // === PARTAGE : construction du texte à partager (Slack / Teams / etc.) ===
  //
  function buildShareText(): string {
    if (!gameOver) return "";

    const attemptsUsed = currentAttempt + 1;

    const headerLines = [
      `SUTOM perso – Jour ${dayIndex + 1}`,
      `Mot de ${word.length} lettres`,
      hasWon
        ? `✅ ${attemptsUsed}/${MAX_ATTEMPTS}`
        : `❌ ${attemptsUsed}/${MAX_ATTEMPTS}`,
      "",
    ];

    const rows = grid
      .slice(0, attemptsUsed)
      .map((row) =>
        row
          .map((cell) => {
            switch (cell.state) {
              case "correct":
                return "🟥";
              case "present":
                return "🟡";
              case "absent":
                return "🟦";
              default:
                return "🟦";
            }
          })
          .join("")
      )
      .join("\n");

    const link = "\n\n👉 https://sutom-perso.vercel.app/";

    return [...headerLines, rows].join("\n") + link;
  }

  async function handleShare() {
    if (!gameOver) return;
    const text = buildShareText();
    if (!text) return;

    try {
      if (
        typeof navigator !== "undefined" &&
        navigator.clipboard &&
        navigator.clipboard.writeText
      ) {
        await navigator.clipboard.writeText(text);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
      } else if (typeof window !== "undefined") {
        // Fallback si clipboard API indisponible
        window.prompt("Copie ce texte :", text);
      }
    } catch (err) {
      console.error("Erreur lors de la copie :", err);
      if (typeof window !== "undefined") {
        window.prompt("Copie ce texte :", text);
      }
    }
  }

  //
  // === RENDER ===
  //
  return (
    <main
      className="min-h-screen flex items-center justify-center bg-neutral-900 text-slate-100 px-2"
      aria-label="Jeu de lettres SUTOM personnalisé"
    >
      <div className="w-full max-w-xl mx-auto rounded-2xl bg-neutral-800 border border-neutral-700 shadow-xl p-4 sm:p-6 relative">
        {/* Header */}
        <header className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">SUTOM perso</h1>
            <p className="text-xs sm:text-sm text-slate-300">
              {formattedDate} · Jour {dayIndex + 1}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowRules(true)}
            className="text-xs sm:text-sm px-3 py-1 rounded-full border border-slate-200 bg-neutral-700 hover:bg-neutral-600"
            aria-haspopup="dialog"
          >
            Règles du jeu
          </button>
        </header>

        {/* Barre de statut */}
        <StatusBar message={statusMessage} hasWon={hasWon} />

        {/* Grille */}
        <GameBoard
          grid={grid}
          animateRowIndex={lastSubmittedRow}
          currentAttempt={currentAttempt}
          knownCorrect={knownCorrect}
          currentInput={currentInput}
          gameOver={gameOver}
          isRevealing={isRevealing}
        />

        {/* Saisie */}
        <form
          className="mt-2 mb-4 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={(e) => {
              const maxLen = word.length;
              const raw = e.target.value.toUpperCase().slice(0, maxLen);
              setCurrentInput(raw);
            }}
            maxLength={word.length}
            disabled={gameOver || isRevealing}
            className="flex-1 px-3 py-3 rounded-lg bg-neutral-700 border border-neutral-600 text-slate-100 text-lg sm:text-xl tracking-widest text-center disabled:opacity-50"
            placeholder={
              gameOver ? "Partie terminée" : `Mot de ${word.length} lettres`
            }
          />

          <button
            type="submit"
            disabled={gameOver || isRevealing}
            className="px-4 sm:px-5 py-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold disabled:opacity-50 text-sm sm:text-base"
          >
            OK
          </button>
        </form>

        {/* Clavier */}
        <Keyboard
          keyRows={[
            ["A", "Z", "E", "R", "T", "Y", "U", "I", "O", "P"],
            ["Q", "S", "D", "F", "G", "H", "J", "K", "L", "M"],
            ["ENTER", "W", "X", "C", "V", "B", "N", "BACKSPACE"],
          ]}
          keyStates={keyStates}
          disabled={gameOver || isRevealing}
          onKeyClick={handleKeyClick}
        />

        {/* Bouton de partage du résultat */}
        {gameOver && (
          <div className="mt-4 flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold"
            >
              Partager le résultat 📋
            </button>
            {shareCopied && (
              <p className="text-xs text-emerald-300">
                Résultat copié dans le presse-papiers !
              </p>
            )}
          </div>
        )}

        {/* Popup Règles du jeu */}
        {showRules && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
            role="dialog"
            aria-modal="true"
            aria-labelledby="rules-title"
          >
            <div className="bg-neutral-800 border border-neutral-600 rounded-xl p-4 w-full max-w-sm mx-4">
              <div className="flex items-center justify-between mb-2">
                <h2 id="rules-title" className="text-lg font-semibold">
                  Règles du jeu
                </h2>
                <button
                  type="button"
                  onClick={() => setShowRules(false)}
                  className="text-sm px-2 py-1 rounded hover:bg-neutral-700"
                >
                  ✕
                </button>
              </div>
              <div className="text-sm text-slate-200 space-y-2">
                <p>
                  Tu dois deviner le mot du jour en 6 essais. La première lettre est
                  toujours révélée et bloquée.
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Rouge : lettre bien placée.</li>
                  <li>Jaune : lettre présente mais ailleurs.</li>
                  <li>Gris : lettre absente du mot.</li>
                  <li>
                    Les lettres déjà trouvées réapparaissent en bleu dans la ligne
                    suivante pour t&apos;aider.
                  </li>
                </ul>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowRules(false)}
                  className="px-3 py-1 rounded-md bg-red-600 hover:bg-red-500 text-sm font-semibold"
                >
                  J&apos;ai compris
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}