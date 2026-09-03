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
[ ] Analisi e comprensione del file sorgente posizionato nel percorso seguente: 
    - \data\sources\source.petcat.txt
[ ] Individuazione di una strategia per ogni tipologia di comando individuato. Verrà aggiornato il seguente file per riportare qui sotto la strategia da impiegare per "tradurre" ogni comando.
[ ] Creazione della pagina html che conterrà la <canvas> in cui renderizzare lo schermo del commodore 64.
[ ] Abbellimento minimale della pagina html principale con un file css (sono consentite librerie esterne come bootstrap)
[ ] Valutare se includere qualche libreria javascript utile allo svolgimento di alcune funzioni (es. underscore)
[ ] Inizio implementazione file javascript con la conversione del videogioco. Creazione del file js.
[ ] Individuazione di ogni carattere PESCII individuato all'interno dei file
    - \data\petscii\c64_lowercase_symbols.json
    - \data\petscii\c64_uppercase_symbols.json
    Ogni carattere avrà un nome o numero associato secondo le convenzioni presenti nel manuale ufficiale del Commodore 64.
[ ] Creazione delle funzioni riguardanti la stampa a video di ogni carattere.
    [ ] Posizionamento del cursore
    [ ] Colore del cursore
    [ ] Stampa di un carattere
[ ] Creazione di altre funzioni che imitano comandi del Commodore 64 (POKE, ecc...) (dettagliare meglio)
[ ] Creazione della funzione main principale che avvia il gioco
[ ] Buon divertimento!