"use client";

type StatusBarProps = {
  message: string;     // texte à afficher (victoire, défaite, info…)
  hasWon: boolean;     // indique si la partie est gagnée (pour la couleur)
};

/**
 * Composant très simple qui affiche un message de statut
 * en dessous du titre et au-dessus de la grille.
 *
 * - Si aucun message → on réserve simplement l’espace (évite les sauts de layout).
 * - Si gagné → texte vert
 * - Si perdu → texte rose
 */
export function StatusBar({ message, hasWon }: StatusBarProps) {
  return (
    <div className="min-h-[1.5rem] mb-4 text-center text-sm">
      {message ? (
        <span className={hasWon ? "text-emerald-400" : "text-rose-300"}>
          {message}
        </span>
      ) : null}
    </div>
  );
}