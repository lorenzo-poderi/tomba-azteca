import { PETSCII_CONTROL_CODES, PETSCII_TOKEN_MAP } from "./petscii-map.js";

const C64_COLORS = Object.freeze({
  black: "#000000",
  white: "#ffffff",
  red: "#883932",
  cyan: "#67b6bd",
  purple: "#8b3f96",
  green: "#55a049",
  blue: "#40318d",
  yellow: "#bfce72",
  orange: "#8b5429",
  brown: "#574200",
  lightRed: "#b86962",
  darkGray: "#403c3c",
  gray: "#6c6c6c",
  lightGreen: "#9ad284",
  lightBlue: "#6c5eb5"
});

const COLOR_CODES = Object.freeze({
  [PETSCII_CONTROL_CODES.wht]: "white",
  [PETSCII_CONTROL_CODES.red]: "red",
  [PETSCII_CONTROL_CODES.cyn]: "cyan",
  [PETSCII_CONTROL_CODES.pur]: "purple",
  [PETSCII_CONTROL_CODES.grn]: "green",
  [PETSCII_CONTROL_CODES.blu]: "blue",
  [PETSCII_CONTROL_CODES.yel]: "yellow",
  [PETSCII_CONTROL_CODES.orng]: "orange",
  [PETSCII_CONTROL_CODES.brn]: "brown",
  [PETSCII_CONTROL_CODES.lred]: "lightRed",
  [PETSCII_CONTROL_CODES.gry1]: "darkGray",
  [PETSCII_CONTROL_CODES.gry2]: "gray",
  [PETSCII_CONTROL_CODES.lgrn]: "lightGreen",
  [PETSCII_CONTROL_CODES.lblu]: "lightBlue"
});

/**
 * Gestisce lo schermo bitmap C64 e lo stato necessario alla stampa PETSCII.
 */
export class PetsciiRenderer {
  constructor(canvas, tables) {
    if (!canvas || canvas.width !== 320 || canvas.height !== 200) {
      throw new Error("Il canvas PETSCII deve avere dimensioni 320x200");
    }

    if (!tables?.lowercase || !tables?.uppercase) {
      throw new Error("Le tabelle PETSCII minuscola e maiuscola sono obbligatorie");
    }

    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.tables = tables;
    this.cursor = { x: 0, y: 0 };
    this.color = "white";
    this.background = "black";
    this.reverse = false;
    this.charset = "lowercase";
    this.clearScreen();
  }

  // C64: PRINT "{clr}"
  clearScreen() {
    this.context.fillStyle = C64_COLORS[this.background];
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.cursor.x = 0;
    this.cursor.y = 0;
  }

  // C64: PRINT "{home}"
  home() {
    this.cursor.x = 0;
    this.cursor.y = 0;
  }

  // C64: PRINT "{up}" / "{down}" / "{left}" / "{rght}"
  moveCursor(direction) {
    const movement = {
      [PETSCII_CONTROL_CODES.up]: [0, -1],
      [PETSCII_CONTROL_CODES.down]: [0, 1],
      [PETSCII_CONTROL_CODES.left]: [-1, 0],
      [PETSCII_CONTROL_CODES.rght]: [1, 0]
    }[direction];

    if (movement) {
      this.cursor.x = Math.max(0, Math.min(39, this.cursor.x + movement[0]));
      this.cursor.y = Math.max(0, Math.min(24, this.cursor.y + movement[1]));
    }
  }

  // C64: PRINT "{wht}" / PRINT "{red}" / PRINT "{grn}" ...
  setColor(color) {
    if (!C64_COLORS[color]) {
      throw new Error(`Colore C64 non riconosciuto: ${color}`);
    }

    this.color = color;
  }

  // C64: PRINT "{rvon}" / PRINT "{rvof}"
  setReverse(enabled) {
    this.reverse = Boolean(enabled);
  }

  // C64: PRINT CHR$(14) / PRINT CHR$(142)
  setCharset(mode) {
    if (mode !== "lowercase" && mode !== "uppercase") {
      throw new Error(`Modalita PETSCII non riconosciuta: ${mode}`);
    }

    this.charset = mode;
  }

  // C64: PRINT CHR$(code)
  printChar(code) {
    if (!Number.isInteger(code) || code < 0 || code > 255) {
      throw new Error(`Codice PETSCII non valido: ${code}`);
    }

    const bitmap = this.tables[this.charset][code];
    if (!bitmap) {
      throw new Error(`Bitmap PETSCII mancante per il codice ${code}`);
    }

    const foreground = this.reverse ? C64_COLORS[this.background] : C64_COLORS[this.color];
    const background = this.reverse ? C64_COLORS[this.color] : C64_COLORS[this.background];
    const originX = this.cursor.x * 8;
    const originY = this.cursor.y * 8;

    this.context.fillStyle = background;
    this.context.fillRect(originX, originY, 8, 8);
    this.context.fillStyle = foreground;

    bitmap.forEach((pixel, index) => {
      if (pixel === 1) {
        this.context.fillRect(originX + (index % 8), originY + Math.floor(index / 8), 1, 1);
      }
    });

    this.advanceCursor();
  }

  // C64: PRINT all charset
  printAll() {

    for (let i = 0; i < this.tables[this.charset].length; i++) {

      const bitmap = this.tables[this.charset][i];
      if (!bitmap) {
        throw new Error(`Bitmap PETSCII mancante per il codice ${code}`);
      }

      const foreground = this.reverse ? C64_COLORS[this.background] : C64_COLORS[this.color];
      const background = this.reverse ? C64_COLORS[this.color] : C64_COLORS[this.background];
      const originX = this.cursor.x * 8;
      const originY = this.cursor.y * 8;

      this.context.fillStyle = background;
      this.context.fillRect(originX, originY, 8, 8);
      this.context.fillStyle = foreground;

      bitmap.forEach((pixel, index) => {
        if (pixel === 1) {
          this.context.fillRect(originX + (index % 8), originY + Math.floor(index / 8), 1, 1);
        }
      });

      this.advanceCursor();
    }

  }

  // C64: PRINT string
  printText(text) {
    const tokens = text.match(/\{[^}]+\}|./gs) ?? [];
    tokens.forEach((token) => {
      const mappedToken = PETSCII_TOKEN_MAP[token];
      if (mappedToken) {
        this.applyToken(mappedToken);
        return;
      }

      if (token === "\n") {
        this.newLine();
        return;
      }

      this.printChar(token.charCodeAt(0));
    });
  }

  // C64: PRINT TAB(column); string
  printAt(column, row, text) {
    this.setCursor(column, row);
    this.printText(text);
  }

  // C64: PRINT string; (avance automatique de colonna)
  advanceCursor() {
    this.cursor.x += 1;
    if (this.cursor.x >= 40) {
      this.newLine();
    }
  }

  // C64: PRINT CHR$(13)
  newLine() {
    this.cursor.x = 0;
    this.cursor.y = Math.min(24, this.cursor.y + 1);
  }

  // C64: POKE 53280, value / POKE 53281, value
  setScreenColors({ background = this.background, border = this.background } = {}) {
    if (!C64_COLORS[background] || !C64_COLORS[border]) {
      throw new Error("Colore C64 non riconosciuto");
    }

    this.background = background;
    this.canvas.style.borderColor = C64_COLORS[border];
    this.clearScreen();
  }

  // C64: PRINT "{home}"; TAB(column); string
  setCursor(column, row) {
    this.cursor.x = Math.max(0, Math.min(39, column));
    this.cursor.y = Math.max(0, Math.min(24, row));
  }

  applyToken(token) {
    if (token.type === "control") {
      if (token.code === PETSCII_CONTROL_CODES.clr) this.clearScreen();
      else if (token.code === PETSCII_CONTROL_CODES.home) this.home();
      else if (token.code === PETSCII_CONTROL_CODES.rvon) this.setReverse(true);
      else if (token.code === PETSCII_CONTROL_CODES.rvof) this.setReverse(false);
      else if (token.code === PETSCII_CONTROL_CODES.swlc) this.setCharset("lowercase");
      else if (token.code === PETSCII_CONTROL_CODES.dish) this.setCharset("uppercase");
      else if (COLOR_CODES[token.code]) this.setColor(COLOR_CODES[token.code]);
      else this.moveCursor(token.code);
      return;
    }

    this.printChar(token.code);
  }
}

export { C64_COLORS, COLOR_CODES };
