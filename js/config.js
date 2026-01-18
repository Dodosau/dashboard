/**
 * config.js
 * Configuration centrale du dashboard
 * (URLs API, IDs, refresh rates, timezone)
 *
 * Tous les widgets doivent lire ici
 * et NE PAS hardcoder leurs valeurs.
 */

window.DASH_CONFIG = {
  /* =========================
     GÉNÉRAL
     ========================= */
  timezone: "America/Montreal",
  locale: "fr-CA",

  /* =========================
     HORLOGE
     ========================= */
  clock: {
    refreshMs: 1000
  },

  /* =========================
     MÉTÉO (ex: Open-Meteo)
     ========================= */
  weather: {
    latitude: 45.5017,
    longitude: -73.5673,
    refreshMs: 10 * 60 * 1000 // 10 minutes
  },

  /* =========================
     STM — BUS 55
     ========================= */
  stm: {
    apiNext: "https://stm-bus.doriansauzede.workers.dev/api/next55-two",
    routeId: "55",
    stopId: "52103",
    refreshMs: 15 * 1000 // 15 secondes
  },

  /* =========================
     CALENDRIER iCloud (via Worker)
     ========================= */
  calendar: {
    apiToday: "https://calendar.doriansauzede.workers.dev/api/today",
    apiUpcoming: "https://calendar.doriansauzede.workers.dev/api/upcoming",
    refreshMs: 5 * 60 * 1000 // 5 minutes
  },

  /* =========================
     MARIAGE
     ========================= */
  wedding: {
    dateISO: "2026-06-17"
  }
};
