// src/lib/getWordOfTheDay.ts

import { START_DATE, WORD_LIST } from "../config/words";

// Calcule combien de jours se sont écoulés depuis le START_DATE
export function getDayIndex(date: Date = new Date()): number {
  const msPerDay = 1000 * 60 * 60 * 24;

  // On normalise les dates à minuit pour éviter les bugs d'heure d'été
  const start = new Date(
    START_DATE.getFullYear(),
    START_DATE.getMonth(),
    START_DATE.getDate()
  );

  const today = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  const diffMs = today.getTime() - start.getTime();
  return Math.floor(diffMs / msPerDay);
}

// Récupère le mot du jour, en bouclant sur la liste
export function getWordOfTheDay(date: Date = new Date()) {
  const dayIndex = getDayIndex(date);
  const listLength = WORD_LIST.length;

  // Modulo pour boucler (gestion du négatif par sécurité)
  const wordIndex = ((dayIndex % listLength) + listLength) % listLength;
  const word = WORD_LIST[wordIndex];

  return { word, wordIndex };
}
