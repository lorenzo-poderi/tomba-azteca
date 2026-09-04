const PETSCII_TABLE_PATHS = Object.freeze({
  lowercase: "data/petscii/c64_lowercase_symbols.json",
  uppercase: "data/petscii/c64_uppercase_symbols.json"
});

const PETSCII_CONTROL_CODES = Object.freeze({
  clr: 147,
  home: 19,
  up: 145,
  down: 17,
  left: 157,
  rght: 29,
  rvon: 18,
  rvof: 146,
  swlc: 14,
  dish: 142,
  wht: 5,
  red: 28,
  cyn: 159,
  pur: 156,
  grn: 30,
  blu: 31,
  yel: 158,
  orng: 129,
  brn: 149,
  lred: 150,
  gry1: 151,
  gry2: 152,
  lgrn: 153,
  lblu: 154,
  a0: 160
});

const PETSCII_KEY_CODES = {
  "CBM-@": 0,
  "CBM-+": 27,
  "CBM--": 28,
  "CBM-*": 29,
  "SHIFT-@": 64,
  "SHIFT-+": 43,
  "SHIFT--": 45,
  "SHIFT-POUND": 92
};

for (const key of "ABCDEFGHIJKLMNOPQRSTUVWXYZ") {
  PETSCII_KEY_CODES[`CBM-${key}`] = key.charCodeAt(0) - 64;
  PETSCII_KEY_CODES[`SHIFT-${key}`] = key.charCodeAt(0);
}

Object.freeze(PETSCII_KEY_CODES);

const PETSCII_TOKEN_MAP = Object.freeze({
  ...Object.fromEntries(
    Object.entries(PETSCII_CONTROL_CODES).map(([token, code]) => [
      `{${token}}`,
      { type: "control", code }
    ])
  ),
  ...Object.fromEntries(
    Object.entries(PETSCII_KEY_CODES).map(([token, code]) => [
      `{${token}}`,
      { type: "glyph", code }
    ])
  ),
  "{$a0}": { type: "glyph", code: PETSCII_CONTROL_CODES.a0 }
});

/**
 * Valida una tabella bitmap PETSCII prima che venga usata dal renderer.
 * @param {unknown} table
 * @param {string} name
 * @returns {number[][]}
 */
export function validatePetsciiTable(table, name) {
  // Una tabella C64 completa contiene 256 codici PETSCII.
  if (!Array.isArray(table) || table.length !== 256) {
    throw new Error(`${name} deve contenere esattamente 256 caratteri PETSCII`);
  }

  table.forEach((bitmap, characterCode) => {
    // Ogni carattere e una griglia 8x8 memorizzata come array piatto.
    if (!Array.isArray(bitmap) || bitmap.length !== 64) {
      throw new Error(`${name}[${characterCode}] deve contenere 64 pixel`);
    }

    // Il renderer interpreta esclusivamente 0 come spento e 1 come acceso.
    if (bitmap.some((pixel) => pixel !== 0 && pixel !== 1)) {
      throw new Error(`${name}[${characterCode}] contiene pixel non binari`);
    }
  });

  return table;
}

/**
 * Carica e valida le tabelle PETSCII minuscola e maiuscola.
 * @param {typeof fetch} fetchImplementation
 * @returns {Promise<{lowercase: number[][], uppercase: number[][]}>}
 */
export async function loadPetsciiTables(fetchImplementation = fetch) {
  // Le due modalita grafiche vengono caricate insieme e restano separate.
  const entries = await Promise.all(
    Object.entries(PETSCII_TABLE_PATHS).map(async ([mode, path]) => {
      const response = await fetchImplementation(path);
      if (!response.ok) {
        throw new Error(`Impossibile caricare la tabella PETSCII ${mode}: ${response.status}`);
      }

      // La validazione avviene prima di rendere la tabella disponibile al renderer.
      const table = await response.json();
      return [mode, validatePetsciiTable(table, mode)];
    })
  );

  return Object.fromEntries(entries);
}

export { PETSCII_CONTROL_CODES, PETSCII_KEY_CODES, PETSCII_TABLE_PATHS, PETSCII_TOKEN_MAP };
