"use client";

type StatusBarProps = {
  message: string; // texte à afficher (victoire, défaite, info…)
  hasWon: boolean; // indique si la partie est gagnée (pour la couleur)
};

/**
 * Barre de statut simple :
 * - Affiche un message de victoire/défaite/information
 * - Réserve de la place même sans message pour éviter les sauts de layout
 * - Utilise aria-live pour être annoncée aux lecteurs d'écran
 */
export function StatusBar({ message, hasWon }: StatusBarProps) {
  return (
    <div
      className="min-h-[1.75rem] mb-4 text-center text-sm sm:text-base"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {message ? (
        <span className={hasWon ? "text-emerald-400" : "text-rose-300"}>
          {message}
        </span>
      ) : null}
    </div>
  );
}