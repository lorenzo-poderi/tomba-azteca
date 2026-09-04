const COMMAND_MESSAGES = Object.freeze({
  unknownVerb: "non capisco!",
  unknownNoun: "non capisco!",
  missingNoun: "prova a specificare un soggetto!",
  emptyInput: '"" non capisco!'
});

/**
 * C64: righe 140-143 e dispatcher dei blocchi 199-875.
 * Esegue il comando riconosciuto e restituisce un risultato per il ciclo principale.
 */
export function dispatchCommand(command, state) {
  if (command.error) {
    return result(COMMAND_MESSAGES[errorMessageKey(command.error)] ?? COMMAND_MESSAGES.unknownVerb, false);
  }

  switch (command.verbText.slice(0, 4)) {
    case "vai":
      return result(null, true, { action: "move", direction: command.nounText });
    case "inve":
      return result(formatInventory(state), true, { action: "inventory" });
    case "aiut":
      return result("usa VERBO + SOGGETTO", true, { action: "help" });
    case "aspe":
      return result("il tempo passa...", true, { action: "wait" });
    case "salv":
      return result(null, false, { action: "save" });
    case "affe":
    case "pren":
    case "cogl":
      return result(null, true, { action: "take", noun: command.nounText });
    case "gett":
    case "lasc":
    case "lanc":
    case "butt":
      return result(null, true, { action: "drop", noun: command.nounText });
    default:
      return result(null, false, { action: "rule", verb: command.verbText, noun: command.nounText });
  }
}

/**
 * C64: righe 430-436.
 * Produce l'elenco degli oggetti con posizione -1, cioe trasportati.
 */
function formatInventory(state) {
  const carried = state.objects.filter((object) => object.location === -1);
  if (carried.length === 0) return "non porto nulla.";
  return `sto portando: ${carried.map((object) => object.name).join("-")}`;
}

function errorMessageKey(error) {
  return {
    "empty-input": "emptyInput",
    "unknown-verb": "unknownVerb",
    "unknown-noun": "unknownNoun",
    "missing-noun": "missingNoun"
  }[error] ?? "unknownVerb";
}

function result(message, redraw, command = {}) {
  return { message, redraw, ...command };
}

export { COMMAND_MESSAGES };
