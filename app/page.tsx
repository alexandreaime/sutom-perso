// src/app/page.tsx

// "use client" indique à Next.js que ce composant s'exécute côté client.
// On en aura besoin plus tard pour utiliser des hooks React (useState, useEffect, etc).
"use client";

export default function HomePage() {
  return (
    // <main> englobe tout le contenu de la page.
    // Ici on centre le contenu et on met un fond sombre avec Tailwind.
    <main className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100">
      {/* Container principal de l'app */}
      <div className="w-full max-w-md mx-4 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-xl p-6">
        {/* Titre de l'appli */}
        <h1 className="text-2xl font-bold text-center mb-1">SUTOM perso</h1>

        {/* Petit sous-titre descriptif */}
        <p className="text-sm text-slate-400 text-center mb-4">
          Devine le mot du jour avec tes collègues 🔤
        </p>

        {/* Zone de contenu provisoire – on la remplira au fur et à mesure */}
        <div className="text-sm text-slate-300">
          <p>
            Ici, on affichera bientôt la grille du jeu, le champ pour taper ton
            mot, et les messages de victoire/défaite. 💪
          </p>
        </div>
      </div>
    </main>
  );
}