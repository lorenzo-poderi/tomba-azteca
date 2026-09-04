const SAVE_KEY = "tomba-azteca-save-v1";
const SAVE_VERSION = 1;

/**
 * C64: righe 855-862.
 * Serializza lo stato di gioco in un salvataggio locale versionato.
 */
export function saveGame(state, storage = localStorage) {
  const payload = {
    version: SAVE_VERSION,
    savedAt: new Date().toISOString(),
    state
  };
  storage.setItem(SAVE_KEY, JSON.stringify(payload));
}

/**
 * C64: righe 8050-8056.
 * Recupera e valida un salvataggio locale senza accedere al filesystem C64.
 */
export function loadGame(storage = localStorage) {
  const serialized = storage.getItem(SAVE_KEY);
  if (!serialized) return null;

  let payload;
  try {
    payload = JSON.parse(serialized);
  } catch {
    throw new Error("salvataggio non valido");
  }

  validateSavePayload(payload);
  return payload.state;
}

/**
 * C64: controllo dei dati letti dalle variabili di gioco.
 * Verifica la struttura minima prima di reinserire lo stato nel gioco.
 */
function validateSavePayload(payload) {
  const state = payload?.state;
  if (payload?.version !== SAVE_VERSION || !state || typeof state !== "object") {
    throw new Error("versione salvataggio non supportata");
  }

  if (!Number.isInteger(state.room) || state.room < 0 || state.room > 37) {
    throw new Error("stanza del salvataggio non valida");
  }
  if (!Array.isArray(state.objects) || !Array.isArray(state.flags) || state.flags.length !== 23) {
    throw new Error("dati del salvataggio incompleti");
  }
}

export { SAVE_KEY, SAVE_VERSION };
