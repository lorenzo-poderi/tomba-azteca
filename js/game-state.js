const INITIAL_OBJECTS = Object.freeze([
  { id: 1, name: "chiavetta", location: 0 },
  { id: 2, name: "chiave", location: 0 },
  { id: 3, name: "mantello rosso", location: 5 },
  { id: 4, name: "spada", location: 0 },
  { id: 5, name: "fune", location: 0 },
  { id: 6, name: "vaso vuoto", location: 0 },
  { id: 7, name: "mappa", location: 0 },
  { id: 8, name: "scrigno", location: 26 },
  { id: 9, name: "pezzo legno", location: 7 },
  { id: 10, name: "salvagente", location: 30 },
  { id: 11, name: "fiaccola", location: 28 },
  { id: 12, name: "baule vecchio", location: 4 },
  { id: 13, name: "pesce", location: 0 },
  { id: 14, name: "topo morto", location: 13 },
  { id: 15, name: "diamante", location: 35 }
]);

/**
 * C64: DIM ob$(15), ob(15), p(22)
 * Crea lo stato iniziale equivalente alle variabili principali del gioco.
 */
export function createInitialGameState() {
  return {
    room: 1,
    previousRoom: 0,
    inventoryCount: 0,
    torchTurns: 40,
    objects: INITIAL_OBJECTS.map((object) => ({ ...object })),
    observables: [],
    flags: Array(23).fill(0),
    screen: {
      cursorX: 0,
      cursorY: 0,
      color: "white",
      reverse: false,
      charset: "lowercase"
    },
    phase: "playing"
  };
}

/**
 * C64: IF ob(i)=-1 THEN pp=pp+1
 * Conta gli oggetti che il giocatore sta trasportando.
 */
export function countInventory(objects) {
  return objects.filter((object) => object.location === -1).length;
}

export { INITIAL_OBJECTS };
