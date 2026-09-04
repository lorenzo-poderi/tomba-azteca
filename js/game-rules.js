import { getRoomConnection } from "./game-data.js";
import { countInventory } from "./game-state.js";

/**
 * C64: righe 199-204, 5060-5061 e 8000-8001.
 * Applica una transizione e restituisce il nuovo stato senza usare GOTO.
 */
export function applyGameAction(state, action) {
  const nextState = cloneState(state);

  switch (action.action) {
    case "move":
      return movePlayer(nextState, action.direction);
    case "take":
      return takeObject(nextState, action.noun);
    case "drop":
      return dropObject(nextState, action.noun);
    case "wait":
      return advanceTurn(nextState, "il tempo passa...");
    default:
      return { state: nextState, message: null, redraw: false, action: "special-rule" };
  }
}

/**
 * C64: righe 202-204.
 * Segue la connessione normale della stanza nella direzione richiesta.
 */
function movePlayer(state, direction) {
  if (isDark(state)) {
    return killPlayer(state, "e' pericoloso muoversi al buio.\nsono caduto e mi sono rotto il collo!");
  }

  const destination = getRoomConnection(state.room, direction);
  if (destination === 0) {
    return { state, message: "non posso andarci!", redraw: false, action: "blocked" };
  }

  state.previousRoom = state.room;
  state.room = destination;
  if (state.room === 37) {
    state.phase = "won";
    return { state, message: "hai completato la tua prima missione!", redraw: true, action: "won" };
  }

  return advanceTurn(state, null, true);
}

/**
 * C64: righe 400-411.
 * Trasporta un oggetto presente nella stanza, rispettando la capacita massima.
 */
function takeObject(state, noun) {
  const object = findObject(state, noun, state.room);
  if (!object) return { state, message: "non lo posso fare adesso!", redraw: false, action: "blocked" };
  if (countInventory(state.objects) >= 5) {
    return { state, message: "non posso portare altro!", redraw: false, action: "blocked" };
  }

  object.location = -1;
  state.inventoryCount = countInventory(state.objects);
  return advanceTurn(state, "o.k.", true);
}

/**
 * C64: righe 530-539.
 * Lascia nella stanza un oggetto trasportato dal giocatore.
 */
function dropObject(state, noun) {
  const object = findObject(state, noun, -1);
  if (!object) return { state, message: "non lo posso fare adesso!", redraw: false, action: "blocked" };

  object.location = state.room;
  state.inventoryCount = countInventory(state.objects);
  return advanceTurn(state, "o.k.", true);
}

/**
 * C64: righe 129-132 e 4001.
 * Consuma un turno della fiaccola e determina se una stanza e al buio.
 */
function advanceTurn(state, message = null, redraw = false) {
  if (state.flags[20] === 1) {
    state.torchTurns -= 1;
    if (state.torchTurns < 0) {
      state.flags[22] = 2;
      state.phase = "dead";
      return { state, message: "fiaccola inutilizzabile!", redraw: true, action: "dead" };
    }
  }

  if (isDark(state)) {
    return { state, message: "non ci vedo, e' troppo buio!", redraw: true, action: "dark" };
  }

  return { state, message, redraw, action: "playing" };
}

/**
 * C64: x=0 e GOTO 9000.
 * Porta lo stato nella fase di fallimento mantenendo il messaggio originale.
 */
function killPlayer(state, message) {
  state.room = 0;
  state.phase = "dead";
  return { state, message, redraw: true, action: "dead" };
}

function isDark(state) {
  return (state.room === 30 || state.room === 37) && state.flags[20] !== 1;
}

function findObject(state, noun, location) {
  const normalizedNoun = noun.slice(0, 3);
  return state.objects.find((object) => object.location === location && object.name.slice(0, 3) === normalizedNoun);
}

function cloneState(state) {
  return {
    ...state,
    objects: state.objects.map((object) => ({ ...object })),
    observables: state.observables.map((observable) => ({ ...observable })),
    flags: [...state.flags],
    screen: { ...state.screen }
  };
}

export { isDark };
