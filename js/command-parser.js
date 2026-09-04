const VERB_VOCABULARY =
  "vai attrnaviinvedai salvcalmaffeprencoglaiutgettlasclancbutt" +
  "guaresamcercucciattamuovrecitaglarraapriindolevaaspemangdicichie" +
  "tiraspinpremaccespegimmepiglvuotannariemfuckpisssaltnuotintrinse";

const NOUN_VOCABULARY =
  "norestsudovealtbaschimanspafunmarvasmaptoplegtavletcaspisbausca" +
  "botporolipiasenelevalalbbanbatponcabnaningsofrusgiatorcamlagsco" +
  "pescanlansopcorspibucisoscrsalsalfiabocsotvilyouofffor" +
  "monaztmurdiapasinc   ";

const DIRECTIONS = Object.freeze(["nord", "est", "sud", "ovest", "alto", "basso"]);
const DIRECTION_ALIASES = Object.freeze({ n: "nord", e: "est", s: "sud", o: "ovest", a: "alto", b: "basso" });

/**
 * C64: cm$ e lo$ sono vocabolari compatti a blocchi fissi.
 * Costruisce la lista dei termini mantenendo gli indici usati dal dispatcher BASIC.
 */
function expandVocabulary(compactVocabulary, blockLength) {
  const vocabulary = [];
  for (let offset = 0; offset < compactVocabulary.length; offset += blockLength) {
    const term = compactVocabulary.slice(offset, offset + blockLength);
    if (term.trim()) vocabulary.push(term);
  }
  return vocabulary;
}

const VERBS = Object.freeze(expandVocabulary(VERB_VOCABULARY, 4));
const NOUNS = Object.freeze(expandVocabulary(NOUN_VOCABULARY, 3));

/**
 * C64: righe 2050-2060
 * Normalizza il comando, applica le abbreviazioni direzionali e risolve verbo/soggetto.
 */
export function parseCommand(input) {
  const raw = String(input ?? "");
  const normalized = raw.toLowerCase();

  if (normalized.length > 16) {
    return createParseResult(raw, normalized, "input-too-long");
  }

  if (!/^[a-z ]*$/.test(normalized)) {
    return createParseResult(raw, normalized, "invalid-character");
  }

  const parts = normalized.trim().split(/ +/).filter(Boolean);
  if (parts.length === 0) {
    return createParseResult(raw, normalized, "empty-input");
  }

  const direction = DIRECTION_ALIASES[parts[0]];
  const verbText = direction ? "vai" : parts[0];
  const nounText = direction ? direction : (parts[1] ?? "");
  const verbId = findVocabularyId(VERBS, verbText, 4);
  const nounId = nounText ? findVocabularyId(NOUNS, nounText, 3) : 0;

  if (verbId === 0) {
    return createParseResult(raw, normalized, "unknown-verb", verbText, nounText, verbId, nounId);
  }

  if (!nounText && !["aiut", "inve", "aspe", "salv"].includes(VERBS[verbId - 1].trim())) {
    return createParseResult(raw, normalized, "missing-noun", verbText, nounText, verbId, nounId);
  }

  if (nounText && nounId === 0) {
    return createParseResult(raw, normalized, "unknown-noun", verbText, nounText, verbId, nounId);
  }

  return createParseResult(raw, normalized, null, verbText, nounText, verbId, nounId);
}

/**
 * C64: confronto di na$(1)/na$(2) con i blocchi di cm$/lo$.
 * Restituisce un indice a partire da 1, come gli array BASIC.
 */
function findVocabularyId(vocabulary, term, blockLength) {
  const abbreviation = term.slice(0, blockLength).padEnd(blockLength, " ");
  const index = vocabulary.findIndex((entry) => entry.slice(0, blockLength) === abbreviation);
  return index === -1 ? 0 : index + 1;
}

function createParseResult(raw, normalized, error, verbText = "", nounText = "", verbId = 0, nounId = 0) {
  return { raw, normalized, verbText, nounText, verbId, nounId, error };
}

export { DIRECTIONS, NOUNS, NOUN_VOCABULARY, VERBS, VERB_VOCABULARY };
