const DIRECTIONS = Object.freeze(["nord", "est", "sud", "ovest", "alto", "basso"]);

const ROOM_CONNECTIONS = Object.freeze([
  "0",
  "000002000000",
  "010000030000",
  "000200000000",
  "000000000001",
  "000000000300",
  "000008000000",
  "000000000006",
  "060900000000",
  "000000080000",
  "080013110000",
  "001000000000",
  "110000000000",
  "100000000000",
  "000000000012",
  "000000140000",
  "001725150000",
  "000000160000",
  "000000170000",
  "201919190000",
  "211919190000",
  "202220200000",
  "212123210000",
  "222222220000",
  "000000000000",
  "160000000000",
  "000000000025",
  "000000000000",
  "000000000000",
  "000000000000",
  "000000002400",
  "000000000000",
  "323232320000",
  "343331330000",
  "003633000000",
  "000000000034",
  "000000340000",
  "000000000000"
]);
/**
 * C64: DATA delle righe 10-47 e VAL(MID$(b$(x), ...)).
 * Restituisce la stanza collegata alla direzione richiesta.
 */
export function getRoomConnection(room, direction) {
  const directionIndex = DIRECTIONS.indexOf(direction);
  const connection = ROOM_CONNECTIONS[room];
  if (directionIndex === -1 || !connection) return 0;
  return Number(connection.slice(directionIndex * 2, directionIndex * 2 + 2));
}

export { ROOM_CONNECTIONS, DIRECTIONS };
