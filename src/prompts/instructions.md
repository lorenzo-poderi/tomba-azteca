# Descrizione
Progetto di conversione di un gioco per Commodore 64 chiamato "Tomba azteca". Traduzione del gioco "Aztec Tomb" di Alligata Software del 1983. Genere, avventura Testuale, PETscii.
https://ready64.org/giochi/aztec-tomb-adventure

# Obiettivo
L'obiettivo di questo progetto è quello di convertire il codice sorgente del video gioco in una versione funzionante scritta con l'ausilio delle seguenti tecnologie:
- html
- javascript
- css

# Elenco dei file da consultare
La conversione del videogioco dovrà essere fatta utilizzando i seguenti file:
 - data\sources\source.petcat.txt           :   file sorgente del videogioco
 - data\petscii\c64_lowercase_symbols.json  :   file per rendering caratteri petscii in minuscolo
 - data\petscii\c64_uppercase_symbols.json  :   file per rendering caratteri petscii in maiuscolo

# Dettagli relativi file con il codice sorgente
Il codice sorgente è stato esportato in un file di testo tramite il software emulatore VICE
(https://vice-emu.sourceforge.io/vice_16.html)

Il file è in formato petcat

## Analisi del sorgente

L'analisi del file `data/sources/source.petcat.txt` e completa. La struttura verificata e la seguente:

- `0-4`: inizializzazione dei colori dello schermo e messaggio di caricamento.
- `10-46`: dati della mappa delle 37 stanze e delle sei direzioni.
- `70-107`: inizializzazione di stanze, oggetti, elementi osservabili, direzioni e vocabolari compatti.
- `107-234`: introduzione, ciclo principale, rendering della stanza, input, movimento e regole speciali.
- `299-875`: gestione dei comandi di osservazione, inventario, oggetti, porte, contenitori, combattimento, personaggi, fiaccola, salvataggio e uscita.
- `2000-2050`: visualizzazione della stanza, oggetti, uscite, pulizia dello schermo e acquisizione/parsing dell'input.
- `4000-5061`: aggiornamento degli oggetti mobili, controllo del buio, messaggi di errore e morte.
- `8000-9060`: vittoria, nuova partita, caricamento, ritorni comuni, schermata di successo e pause.
- `9098-10100`: correzione del conteggio delle parole e gestione dell'input da tastiera.
- `20000-21000`: introduzione e grafica iniziale.
- `25000-25190`: istruzioni mostrate al giocatore.
- `29488-30520`: conversione dei dati grafici e routine di rendering/descritte delle stanze.

### Flusso di esecuzione

L'esecuzione parte dalla riga `0`, mostra l'introduzione e offre il caricamento da cassetta alle righe `110-112`. Il ciclo principale renderizza la stanza corrente alla riga `120`, acquisisce il comando alle righe `133-136`, lo analizza alla routine `2050` e cerca verbo e sostantivo nei vocabolari alle righe `140-143`. Le direzioni abbreviate `N`, `E`, `S`, `O`, `A` e `B` vengono convertite in `VAI` piu direzione. Dopo l'azione, il flusso torna al rendering della stanza o alla richiesta di input.

L'input ha una lunghezza massima di 16 caratteri, accetta lettere minuscole e spazi, supporta `DEL` tramite `CHR$(20)` e termina con `RETURN` (`CHR$(13)`). Il formato principale e `VERBO + SOGGETTO`; `AIUTA` e `INVENTARIO` sono utilizzabili senza soggetto.

### Stato di gioco

- `x`: stanza corrente; `x=0` indica morte/fallimento e `x=37` attiva la vittoria.
- `ob$(1..15)` e `ob(1..15)`: nomi e posizione degli oggetti.
- `nm$(1..32)` e `nm(1..32)`: nomi e posizione degli elementi osservabili.
- `c$(1..6)`: direzioni `NORD`, `EST`, `SUD`, `OVEST`, `ALTO`, `BASSO`.
- `pp`: numero di oggetti trasportati, con capacita massima pari a 5.
- `p(1..22)`: flag per eventi come porta, cassetto, baule, passaggio del ruscello, vaso, fune, nano, elefante, battello, salvagente, mappa e fiaccola.
- `gg`: durata residua della fiaccola, inizializzata a 40.
- `op`: stanza precedente usata per alcuni passaggi temporanei.
- `ob(i)=-1`: oggetto trasportato; `ob(i)=-2`: oggetto indossato; valore positivo: stanza dell'oggetto.

Gli oggetti iniziali sono chiavetta, chiave, mantello rosso, spada, fune, vaso vuoto, mappa, scrigno, pezzo di legno, salvagente, fiaccola, baule vecchio, pesce, topo morto e diamante. Le loro posizioni sono definite alle righe `78-80`.

### Movimento, eventi e condizioni finali

Le direzioni normali leggono la mappa `b$(x)` alle righe `199-204`. Sono presenti regole speciali per porta, ruscello, toro, nuoto, elefante, battello, lancia, fune, muro, diamante e tomba. Le descrizioni grafiche delle stanze sono selezionate dal dispatcher alle righe `29510-29570` e realizzate nelle routine `30009-30513`.

La vittoria avviene raggiungendo `x=37` e viene mostrata alle righe `8000-8001`. Le condizioni di fallimento includono buio, cadute, affondamento e nuoto senza capacità adeguate; in questi casi il gioco porta normalmente `x` a `0`. Il comando di uscita passa dalle righe `8010-8014` e chiede se iniziare una nuova partita. Salvataggio e caricamento usano rispettivamente le routine `855-862` e `8050-8056`.

### Rendering e controlli C64 rilevati

Il sorgente usa codici `petcat` per `CLR`, `HOME`, movimento del cursore, reverse video, colori e caratteri grafici `CBM`/`SHIFT`. I colori sono impostati prima della stampa e devono quindi essere modellati come stato del cursore. I `POKE` rilevati riguardano bordo e sfondo (`53280`, `53281`), controllo tastiera (`788`) e controlli di integrita grafica tramite `PEEK` alle locazioni `35143-35145`.

### Punti da confermare nello step 2

- Il vocabolario dei verbi e dei sostantivi e compresso in gruppi di quattro caratteri: i nomi completi devono essere ricostruiti confrontando i rami `cm=...` e `lo=...`.
- Alcuni flag `p(1..22)` hanno un significato dedotto dai test e dalle mutazioni, ma non sono nominati esplicitamente nel BASIC.
- Il controllo `x3+x4+x5<>0` alla riga `145`, che puo eseguire `NEW`, potrebbe essere una protezione antipirateria o un controllo hardware e richiede una decisione di conversione.
- I valori speciali delle posizioni oggetto `0`, `-1` e `-2` devono essere mantenuti nella rappresentazione dello stato.
- Refusi e messaggi insoliti presenti nel sorgente devono essere preservati salvo decisione documentata.

## Strategia di conversione

Lo step 2 e completato a livello progettuale. L'implementazione verra eseguita negli step successivi e dovra seguire questa strategia.

### Struttura dei moduli

Usare HTML, CSS e JavaScript standard, senza framework o dipendenze esterne finche non emerge una necessita concreta. La struttura prevista e:

```text
index.html
css/game.css
js/main.js
js/game-state.js
js/game-data.js
js/command-parser.js
js/command-dispatcher.js
js/game-rules.js
js/c64-runtime.js
js/petscii-renderer.js
js/persistence.js
```

- `index.html`: canvas, area di input e controlli essenziali.
- `css/game.css`: layout responsive e resa pixelata del canvas.
- `main.js`: inizializzazione, collegamento degli eventi e ciclo input-rendering.
- `game-state.js`: creazione, lettura e aggiornamento dello stato.
- `game-data.js`: mappa, oggetti, osservabili, vocabolari e dati grafici.
- `command-parser.js`: normalizzazione minima, tokenizzazione e risoluzione degli indici.
- `command-dispatcher.js`: associazione tra verbo e gestione dell'azione.
- `game-rules.js`: transizioni, condizioni speciali, morte e vittoria.
- `c64-runtime.js` e `petscii-renderer.js`: primitive C64 e rendering bitmap.
- `persistence.js`: salvataggio e caricamento locale con validazione.

### Modello dello stato

Rappresentare esplicitamente almeno questi dati:

```js
{
    room: 1,
    previousRoom: 0,
    inventoryCount: 0,
    torchTurns: 40,
    objects: [],
    observables: [],
    flags: [],
    screen: {
        cursorX: 0,
        cursorY: 0,
        color: "white",
        reverse: false,
        charset: "lowercase"
    },
    phase: "playing"
}
```

Mantenere gli indici originali `p(1..22)`, gli identificatori dei verbi e dei sostantivi e i valori speciali degli oggetti: stanza positiva, `-1` trasportato e `-2` indossato. La capacita dell'inventario resta 5 e la fiaccola parte da 40. Verificare durante i test il decremento della fiaccola nelle righe BASIC `129-130` prima di fissarne l'equivalente JavaScript.

### Dati, mappa e regole

In `game-data.js` trasferire senza alterazioni arbitrarie:

- le 37 righe della mappa dalle righe BASIC `10-46`;
- le sei direzioni nell'ordine nord, est, sud, ovest, alto, basso;
- oggetti e posizioni dalle righe `78-80`;
- elementi osservabili dalle righe `88-93`;
- vocabolari originali e relative tabelle di espansione;
- descrizioni e sequenze grafiche associate alle stanze.

Le transizioni normali useranno la mappa. Le eccezioni verranno espresse come regole leggibili in `game-rules.js`, includendo porta, ruscello, toro, nuoto, elefante, battello, lancia, fune, muro, diamante e tomba. Non tradurre i `GOTO` uno a uno: modellare invece le condizioni e il risultato di ogni azione.

### Parser e dispatcher

Il parser deve:

1. rispettare il limite di 16 caratteri;
2. gestire lettere, spazi, input vuoto, `DEL` e `RETURN` secondo il comportamento osservato;
3. dividere l'input in verbo e soggetto;
4. convertire `N`, `E`, `S`, `O`, `A` e `B` in `VAI` piu direzione;
5. risolvere i verbi nei blocchi di quattro caratteri di `cm$` e i sostantivi nei blocchi di tre caratteri di `lo$`;
6. conservare gli indici numerici necessari al dispatcher BASIC;
7. non aggiungere correzioni automatiche, articoli o sinonimi non presenti nell'originale.

Il risultato del parser deve distinguere input grezzo, verbo, soggetto, relativi indici ed eventuale errore. `AIUTA` e `INVENTARIO` devono funzionare senza soggetto. Il dispatcher deve associare gli indici a gestori separati per movimento, osservazione, presa, inventario, apertura, equipaggiamento, rilascio, arrampicata, nuoto, uso di oggetti, combattimento, dialogo, fiaccola, attesa, salvataggio e uscita.

Ogni gestore deve ricevere lo stato e il comando, applicare una transizione deterministica, produrre i messaggi originali e indicare se il turno richiede un nuovo rendering.

### Runtime C64 e rendering

Centralizzare in `c64-runtime.js` primitive equivalenti a `clearScreen`, `setCursor`, `moveCursor`, `setColor`, `setReverse`, `setCharset`, `printChar`, `printText` e `printAt`. Le stringhe `PRINT` devono essere tokenizzate e interpretate, non inserite come testo HTML.

`petscii-renderer.js` deve gestire `{clr}`, `{home}`, `{up}`, `{down}`, `{left}`, `{rght}`, `{rvon}`, `{rvof}`, i colori e i caratteri `{CBM-*}`/`{SHIFT-*}` effettivamente usati dal sorgente. Il canvas deve restare a 320x200 pixel logici, con griglia 40x25 e celle 8x8, usando esclusivamente le bitmap JSON quando e richiesta la resa PETSCII. Validare entrambe le tabelle come 256 caratteri da 64 valori binari.

I `POKE 53280` e `POKE 53281` aggiorneranno rispettivamente bordo e sfondo. `POKE 788` sara rappresentato come stato astratto della tastiera. I `PEEK` alle locazioni C64 non accederanno a memoria reale del browser.

### Salvataggio e stati finali

Usare `localStorage` con una chiave versionata per sostituire il salvataggio su cassetta delle routine BASIC `855-862`. Salvare stanza, stanza precedente, inventario, oggetti, osservabili, flag, durata e stato della fiaccola. Validare versione, tipi, intervalli e campi obbligatori; un salvataggio corrotto deve produrre un messaggio e permettere una nuova partita.

Rappresentare almeno le fasi `title`, `instructions`, `playing`, `dead` e `won`. La morte imposta `room=0`, la vittoria e attivata da `room=37`, e la nuova partita ricrea lo stato iniziale senza ricaricare la pagina. Il loop infinito dell'uscita BASIC verra sostituito da un'attesa interattiva equivalente.

### Decisioni sui punti incerti

- Il controllo hardware/antipirateria basato su `PEEK` e checksum non deve eseguire `NEW` o cancellare lo stato nel browser: verra registrato come diagnostica opzionale.
- I refusi, la punteggiatura e i messaggi insoliti dell'originale vanno conservati; eventuali correzioni saranno decisioni esplicite e documentate.
- I flag manterranno la numerazione originale, con nomi descrittivi solo in una tabella di mappatura.
- Non simulare dispositivo o filesystem C64: il salvataggio locale e l'equivalente browser approvato.

### Criteri di completamento dello step 2

Lo step 2 e considerato completo quando ogni comando e categoria tecnica rilevata nello step 1 ha una strategia assegnata, i punti incerti hanno una decisione documentata, la struttura dei moduli e il modello dello stato sono definiti e il piano di test e sufficiente per verificare parser, transizioni, bitmap e persistenza. Solo a quel punto si puo procedere allo step 3.

## Piano per la mappatura PETSCII

Per lo step 5 adottare un approccio ibrido:

- validare subito entrambe le tabelle complete, ciascuna composta da 256 bitmap di 64 valori binari;
- caricare le tabelle senza copiare o riscrivere le bitmap in JavaScript;
- implementare e verificare il rendering per incrementi, iniziando da un carattere testuale e proseguendo con spaziatura PETSCII, controlli, colori, reverse video, modalita maiuscola/minuscola, caratteri `CBM` e caratteri `SHIFT`;
- mantenere una mappa centralizzata tra token PETCAT, codici numerici e comportamento, includendo i caratteri generati dinamicamente con `CHR$`;
- distinguere i token realmente stampati da quelli presenti solo nei commenti `REM`.

Non usare una mappatura parziale hardcoded come soluzione finale: le routine grafiche delle stanze usano un repertorio ampio di caratteri `CBM` e `SHIFT`, quindi una soluzione limitata alla schermata iniziale nasconderebbe errori nelle scene successive. Lo step 5 potra essere marcato completo solo dopo aver validato entrambe le tabelle, risolto tutti i token usati dal sorgente e verificato almeno un caso per ogni categoria di carattere e controllo.

## Valutazione delle dipendenze

Lo step 4 e completato: non sono necessarie dipendenze esterne. HTML, CSS e JavaScript standard, insieme alle API native del browser (`CanvasRenderingContext2D`, eventi tastiera e `localStorage`), sono sufficienti per il canvas PETSCII, il parser, lo stato, il rendering e il salvataggio.

Non introdurre framework, bundler o librerie come Underscore/Bootstrap senza una necessita concreta. Qualunque dipendenza futura deve essere motivata in questo documento, installata in modo riproducibile e verificata rispetto alla compatibilita con il porting fedele del C64.

# Dettagli relativi al videogioco
Il videogioco è un'avventura testuale con grafica costruita tramite caratteri PETSCII.
L'avventura consiste nell'inserimento di istruzioni come comandi da impartire nel seguente formato:
- VERBO + SOGGETTO

Ad esempio il seguente testo è un comando valido:
- ARRAMPICA VILLA

# Dettagli relativi alla conversione del videogioco
Occorre valutare preventivamente cosa è convertibile e come questo viene fatto.
Segue un elenco di istruzioni su come convertire le varie istruzioni che si presenteranno.

## Conversione della finestra 
L'intera finestra di lavoro corrisponderà ad un elemento html di tipo <canvas> delle dimensioni identiche alla risoluzione di un Commodore 64, ovvero 320x200

## Conversione di elementi grafici basati su testo PETSCII
Ogni qualvolta si occorrerà stampare a video un carattere petscii, questo verrà convertito in un suo equivalente fatto da una matrice di 8x8 pixel all'interno di una canvas.

L'elemento da disegnare terrà conto della posizione corrente del cursore, del suo colore e della distinzione tra maiuscole e minuscole, replicando il comportamento del commodore 64.

Le informazioni relative ad ogni carattere PETSCII saranno contenute all'interno dei file seguenti:
- \data\petscii\c64_lowercase_symbols.json
- \data\petscii\c64_uppercase_symbols.json

Ognuno di questi due file json contiene un elenco di 256 array di elementi, nel quale ogni elemento è un array formato da 8x8 = 64 valori 0 o 1.

Ad esempio i primi due array potrebbero essere i seguenti:
[
  [0,0,1,1,1,1,0,0,0,1,1,0,0,1,1,0,0,1,1,0,1,1,1,0,0,1,1,0,1,1,1,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,1,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,1,1,0,0,0,1,1,1,1,1,0,0,1,1,0,0,1,1,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0]
]

Ogni singolo array, corrisponde ad un carattere PETSCII e va interpretando gli 0 come pixel spenti e gli 1 come pixel accesi.

Tali pixel, raggruppati a gruppi di 8, formano una matrice 8x8 corrispondente al disegno raster completo del carattere PETSCII.

Ad esempio, questa è la rappresentazione del primo array riportato nell'esempio precedente:

0,0,1,1,1,1,0,0
0,1,1,0,0,1,1,0
0,1,1,0,1,1,1,0
0,1,1,0,1,1,1,0
0,1,1,0,0,0,0,0
0,1,1,0,0,0,1,0
0,0,1,1,1,1,0,0
0,0,0,0,0,0,0,0

Sostituendo gli 0 con degli _ e gli 1 con delle X si può notare come il disegno risultante corrisponda al carattere "@" in PETSCII.

_,_,X,X,X,X,_,_
_,X,X,_,_,X,X,_
_,X,X,_,X,X,X,_
_,X,X,_,X,X,X,_
_,X,X,_,_,_,_,_
_,X,X,_,_,_,X,_
_,_,X,X,X,X,_,_
_,_,_,_,_,_,_,_


## Conversione dei colori dei caratteri
Per agevolare la conversione e creare una sorta di emulazione del comportamento del commodore 64 i caratteri e i loro colori verranno renderizzati seguendo la logica con la quale si scrivevano su C64.
Ad esempio se per stampare un carattere in blu, prima si impostava il colore blu sul cursore e quindi si stampava il carattere interessato che risultava essere blu.
Così facendo il codice che riempirà le righe della videata sarà molto simile a quanto avveniva per commodore.

Es. di un codice di stampa scritto in petcat in cui vengono impostati dei colori del cursore:
30319 print"{rvon}{grn}            {brn}  {grn}          "

## Codici di movimento
All'interno del codice sorgente sono presenti, scritti in modalità petcat, dei codici corrispondenti ai movimenti del cursore.
Consentono ad esempio di muovere il cursorse ad inizio o fine riga, oppure ad inizio schermo.
Anche questi movimenti verranno replicati movimentando una variabile che rappreseterà la posizione del cursore.


## Creazione di funzioni senza GOTO
Chiaramente ogni funzione presente nel codice sorgente verrà tradotta secondo uno stile più moderno, ovvero senza salti di codice e l'utilizzo del GOTO.


# Fasi dello sviluppo
Le fasi dello sviluppo saranno le seguenti. 
Verranno smarcate man mano che verranno implementate le varie fasi:
[x] Analisi e comprensione del file sorgente posizionato nel percorso seguente: 
    - \data\sources\source.petcat.txt
[x] Individuazione di una strategia per ogni tipologia di comando individuato. Verrà aggiornato il seguente file per riportare qui sotto la strategia da impiegare per "tradurre" ogni comando.
[x] Creazione della pagina html che conterrà la <canvas> in cui renderizzare lo schermo del commodore 64. Completata in `index.html` con canvas logico 320x200 e area di inserimento comandi.
[x] Abbellimento minimale della pagina html principale con un file css: creato `css/game.css` con layout responsive e canvas pixelated, senza alterare la risoluzione logica.
[x] Valutare se includere qualche libreria javascript utile allo svolgimento di alcune funzioni (es. underscore): non necessaria; usare API native e JavaScript standard.
[x] Inizio implementazione file javascript con la conversione del videogioco. Creati i moduli PETSCII `js/petscii-map.js` e `js/petscii-renderer.js`; la logica completa del gioco verra aggiunta negli step successivi.
[x] Individuazione di ogni carattere PESCII individuato all'interno dei file. Completata la validazione delle due tabelle e creata la mappa centralizzata in `js/petscii-map.js`; il rendering dei caratteri resta nello step 6.
    - \data\petscii\c64_lowercase_symbols.json
    - \data\petscii\c64_uppercase_symbols.json
    Ogni carattere avrà un nome o numero associato secondo le convenzioni presenti nel manuale ufficiale del Commodore 64.
[x] Creazione delle funzioni riguardanti la stampa a video di ogni carattere.
    [x] Posizionamento del cursore
    [x] Colore del cursore
    [x] Stampa di un carattere
[x] Creazione di altre funzioni che imitano comandi del Commodore 64 (POKE, ecc...). Implementate primitive per `PRINT`, `POKE 53280` e `POKE 53281`; `PEEK` resta astratto per il browser.
[x] Modellazione iniziale dello stato e dell'interprete dei comandi: creati `js/game-state.js` e `js/command-parser.js`, con stato iniziale, oggetti, inventario, vocabolari compatti, abbreviazioni direzionali e gestione degli input invalidi. Dispatcher e regole delle stanze restano da implementare.
[x] Dispatcher iniziale dei comandi e dati della mappa: creati `js/command-dispatcher.js` e `js/game-data.js`, con movimento delegato alle regole, inventario, aiuto, attesa e messaggi di errore. Restano da implementare le regole speciali delle stanze e il ciclo principale.
[x] Regole base delle transizioni: creato `js/game-rules.js` con movimento da mappa, raccolta/rilascio oggetti, consumo della fiaccola, buio, morte e vittoria. Restano da convertire le eccezioni narrative specifiche del sorgente.
[x] Salvataggio e caricamento: creato `js/persistence.js` con `localStorage`, versione del formato e validazione dei dati.
[x] Creazione della funzione main principale che avvia il gioco: creato `js/main.js` e collegato a `index.html`; restano da completare le routine narrative e grafiche dell'originale.
[ ] Buon divertimento!