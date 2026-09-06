import { parseCommand } from "./command-parser.js";
import { dispatchCommand } from "./command-dispatcher.js";
import { applyGameAction } from "./game-rules.js";
import { createInitialGameState } from "./game-state.js";
import { loadPetsciiTables } from "./petscii-map.js";
import { PetsciiRenderer } from "./petscii-renderer.js";
import { DIRECTIONS, getRoomConnection } from "./game-data.js";
import { loadGame, saveGame } from "./persistence.js";

let gameState;
let renderer;

/**
 * C64: righe 0-4, 107 e 110.
 * Carica le bitmap, inizializza lo stato e avvia il ciclo di input.
 */
export async function main() {
  const canvas = document.querySelector("#game-screen");
  const form = document.querySelector("#command-form");
  const input = document.querySelector("#command-input");
  const newGameButton = document.querySelector("#new-game");
  const saveGameButton = document.querySelector("#save-game");
  const loadGameButton = document.querySelector("#load-game");

  try {
    const tables = await loadPetsciiTables();
    renderer = new PetsciiRenderer(canvas, tables);
    gameState = createInitialGameState();
    form.addEventListener("submit", (event) => handleCommand(event, input));
    newGameButton.addEventListener("click", () => {
      gameState = createInitialGameState();
      renderGame();
      input.focus();
    });
    saveGameButton.addEventListener("click", saveCurrentGame);
    loadGameButton.addEventListener("click", () => restoreGame(input));
    renderGame();
    input.focus();
  } catch (error) {
    canvas.replaceWith(document.createTextNode(`Errore di avvio: ${error.message}`));
  }
}

/**
 * C64: righe 133-144 e GOSUB 2050.
 * Interpreta l'input, applica il comando e aggiorna lo stato visualizzato.
 */
function handleCommand(event, input) {
  event.preventDefault();
  const command = parseCommand(input.value);
  const dispatched = dispatchCommand(command, gameState);
  const transition = applyGameAction(gameState, dispatched);
  gameState = transition.state;

  if (transition.redraw || dispatched.redraw) renderGame();
  showMessage(transition.message ?? dispatched.message ?? "");
  input.value = "";
  input.focus();
}

/**
 * C64: righe 857-860.
 * Salva lo stato e mostra l'esito dell'operazione nel terminale di gioco.
 */
function saveCurrentGame() {
  try {
    saveGame(gameState);
    showMessage("salvataggio completato.");
  } catch (error) {
    showMessage(`salvataggio fallito: ${error.message}`);
  }
}

/**
 * C64: righe 8051-8056.
 * Carica lo stato locale e ridisegna la stanza corrente.
 */
function restoreGame(input) {
  try {
    const savedState = loadGame();
    if (!savedState) {
      showMessage("nessun salvataggio trovato.");
      return;
    }
    gameState = savedState;
    renderGame();
    showMessage("partita caricata.");
    input.focus();
  } catch (error) {
    showMessage(`caricamento fallito: ${error.message}`);
  }
}

function showMessage(message) {
  renderer.printAt(0, 23, " ".repeat(40));
  renderer.printAt(0, 23, message);
}

/**
 * C64: righe 120, 2000 e 2020.
 * Ridisegna una schermata minima con stanza, oggetti ed uscite disponibili.
 */
function renderGame() {
  debugger;
  renderer.clearScreen();
  
  //renderer.printAll();
  
  renderer.printAt(0, 0, `stanza ${gameState.room}`);

  const objects = gameState.objects
    .filter((object) => object.location === gameState.room)
    .map((object) => object.name)
    .join("-");
  renderer.printAt(0, 2, objects ? `vedo: ${objects}` : "vedo: nulla");

  const exits = DIRECTIONS
    .filter((direction) => getRoomConnection(gameState.room, direction) !== 0)
    .join(" ");
  renderer.printAt(0, 4, exits ? `uscite ${exits}` : "nessuna uscita");
}

if (typeof document !== "undefined") {
  main();
}
