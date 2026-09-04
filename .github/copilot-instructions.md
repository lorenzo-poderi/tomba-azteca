 # Tomba Azteca - Istruzioni per Copilot

 ## Contesto del progetto

 Questo repository contiene il porting per il web del videogioco "Tomba azteca", traduzione di "Aztec Tomb" di Alligata Software (1983) per Commodore 64. Si tratta di un'avventura testuale con grafica composta da caratteri PETSCII.

 L'obiettivo e ottenere una versione funzionante in HTML, CSS e JavaScript, mantenendo il piu possibile il comportamento, i testi, i comandi, i colori e la resa grafica dell'originale.

 ## Fonti di verita

 Prima di implementare o modificare una funzione, consultare il sorgente originale:

 - `data/sources/source.petcat.txt`: codice BASIC esportato con `petcat`; e la fonte primaria per flusso di gioco, testi, comandi, coordinate e codici di controllo.
 - `data/petscii/c64_lowercase_symbols.json`: bitmap dei 256 caratteri PETSCII nella modalita minuscola.
 - `data/petscii/c64_uppercase_symbols.json`: bitmap dei 256 caratteri PETSCII nella modalita maiuscola.
 - `src/prompts/instructions.md`: note progettuali e requisiti di conversione da mantenere aggiornati quando cambiano le decisioni architetturali.

 Non inventare testi, comandi, messaggi, coordinate o regole di gioco quando possono essere ricavati dal sorgente. Se il comportamento dell'originale non e chiaro, segnalarlo nel codice o nella documentazione e scegliere una soluzione reversibile.

 ## Regole di implementazione

 - Usare HTML, CSS e JavaScript standard, salvo una necessita concreta e documentata per una dipendenza esterna.
 - Seguire la struttura gia presente nel repository e aggiungere nuovi file solo quando servono.
 - Tradurre la logica in funzioni e strutture di controllo moderne: non usare `GOTO` e non riprodurre salti di codice non necessari.
 - Separare, quando possibile, stato del gioco, interpretazione dei comandi, emulazione dello schermo e rendering.
 - Evitare di alterare il comportamento del gioco per correggere presunti errori dell'originale senza esplicita motivazione.
 - Mantenere le modifiche piccole e focalizzate; non fare refactoring estranei alla richiesta.
 - Usare nomi descrittivi e commenti solo per chiarire logica non evidente.
 - Preservare i testi italiani e la distinzione tra maiuscole e minuscole rilevante per PETSCII.

 ## Schermo e rendering PETSCII

 La finestra di gioco deve essere rappresentata da un elemento HTML `<canvas>` con risoluzione logica Commodore 64 di 320x200 pixel. Il ridimensionamento visivo deve mantenere le proporzioni e non deve modificare la risoluzione logica.

 Ogni carattere PETSCII e una bitmap di 8x8 pixel, rappresentata da un array piatto di 64 valori `0` o `1` nei file JSON. Raggruppare i valori otto alla volta per ottenere le righe del carattere.

 Il renderer deve:

 - selezionare la tabella maiuscola o minuscola corretta;
 - interpretare `0` come pixel spento e `1` come pixel acceso;
 - disegnare i caratteri nella cella corrente di 8x8 pixel;
 - mantenere posizione del cursore, colore corrente e modalita testo;
 - gestire ritorno a capo, avanzamento, inizio/fine riga e inizio schermo secondo i codici del sorgente;
 - rispettare i codici PETSCII di controllo e colore presenti nel formato `petcat`;
 - evitare il rendering tramite font di sistema quando e richiesta la bitmap PETSCII.

 Per una resa fedele, preferire il disegno a risoluzione nativa e usare un'immagine non sfocata (`image-rendering: pixelated` dove appropriato). Verificare che canvas e contenitore non introducano deformazioni.

 ## Colori e codici di controllo

 I colori sono proprieta del cursore: impostare il colore prima di stampare un carattere deve influire sui caratteri successivi, come sul C64. Supportare i codici di colore e gli attributi di stampa presenti nel sorgente, inclusa la modalita reverse video quando utilizzata.

 Esempio dal sorgente:

 `30319 PRINT "{rvon}{grn}            {brn}  {grn}          "`

 Non sostituire i codici di controllo con testo visibile. Centralizzare la loro conversione in un modulo o in funzioni riutilizzabili.

 ## Comandi e logica del gioco

 L'input del giocatore segue principalmente il formato `VERBO + SOGGETTO`, per esempio `ARRAMPICA VILLA`. L'interprete deve normalizzare l'input solo quanto necessario e mantenere le regole e i messaggi definiti dal sorgente.

 Rappresentare esplicitamente lo stato del gioco, inclusi posizione, inventario, flag, punteggio, oggetti e condizioni gia visitate quando presenti nel programma originale. Evitare variabili globali sparse e rendere ogni transizione di stato deterministica e verificabile.

 Le routine equivalenti a comandi C64 come `PRINT`, `POKE` o gestione del cursore devono avere funzioni JavaScript con responsabilita chiare. La funzione di avvio deve inizializzare lo schermo e lo stato, quindi avviare il ciclo di input senza dipendere da `GOTO` o da attese bloccanti.

 ## Verifica delle modifiche

 Dopo ogni modifica significativa:

 - controllare la console del browser per errori JavaScript;
 - verificare che la pagina si apra e che il canvas sia visibile;
 - provare input validi, input vuoti e comandi non riconosciuti;
 - confrontare testi, colori, posizione del cursore e sequenza degli eventi con `source.petcat.txt`;
 - verificare che il canvas mantenga 320x200 come dimensione logica anche su schermi piu grandi o piccoli;
 - validare la sintassi JSON quando si modificano le tabelle PETSCII.

 Aggiungere test automatici per parser, transizioni di stato e conversione delle bitmap quando la struttura del progetto lo consente. Non dichiarare completata una fase solo perche la pagina carica: verificare anche il comportamento osservabile.

 ## Sviluppo per step successivi

 L'implementazione deve procedere in modo incrementale e nell'ordine seguente. Non iniziare uno step successivo finche quello corrente non e stato analizzato, implementato e verificato. Ogni modifica deve riguardare lo step attivo o essere indispensabile per mantenerlo funzionante.

 1. **Analisi del sorgente**
	 - Leggere `data/sources/source.petcat.txt` per comprenderne struttura, punti di ingresso, sottoprogrammi e flusso di esecuzione.
	 - Individuare testi, comandi, variabili, flag, oggetti, colori, codici PETSCII, movimenti del cursore, `POKE` e condizioni di vittoria o uscita.
	 - Produrre una mappa consultabile prima di scrivere la logica del gioco.
	 - Verificare che l'analisi copra l'intero sorgente, non solo la schermata iniziale.

 2. **Strategia di conversione**
	 - Catalogare ogni tipologia di comando e definire come verra tradotta in HTML, CSS o JavaScript.
	 - Stabilire la rappresentazione dello stato del gioco e la corrispondenza tra routine BASIC e funzioni JavaScript.
	 - Definire la conversione dei codici di controllo `petcat`, dei colori, del reverse video e dei movimenti del cursore.
	 - Registrare decisioni, dubbi e comportamenti non determinabili nel file `src/prompts/instructions.md`.
	 - Non procedere all'implementazione della logica finche non esiste una strategia per ogni comando individuato.

 3. **Struttura minima della pagina**
	 - Creare la pagina HTML principale con un `<canvas>` per lo schermo C64.
	 - Impostare la risoluzione logica a 320x200 e predisporre l'area per l'inserimento dei comandi.
	 - Verificare che la pagina si carichi senza errori e che il canvas sia visibile prima di aggiungere la logica di gioco.

 4. **Valutazione delle dipendenze**
	 - Valutare se una libreria JavaScript sia realmente necessaria per parser, rendering o gestione dello stato.
	 - Preferire le API del browser e JavaScript standard quando sono sufficienti.
	 - Aggiungere una dipendenza esterna solo dopo averne motivato il beneficio e averne documentato installazione e utilizzo.

 5. **Mappatura PETSCII**
	 - Esaminare le tabelle `c64_lowercase_symbols.json` e `c64_uppercase_symbols.json`.
	 - Verificare che ciascuna contenga i 256 caratteri e che ogni bitmap contenga esattamente 64 valori binari.
	 - Associare ogni codice PETSCII usato dal sorgente al relativo indice e alla relativa modalita maiuscola o minuscola.
	 - Centralizzare questa mappatura; non duplicare bitmap o indici in piu moduli.

 6. **Renderer e primitive C64**
	 - Creare il file JavaScript e le funzioni di base per inizializzare lo schermo, posizionare il cursore, impostare il colore e stampare un carattere.
	 - Implementare stampa di stringhe, ritorno a capo, avanzamento, inizio/fine riga e inizio schermo.
	 - Implementare i codici PETSCII di controllo, inclusi colori e reverse video, secondo il sorgente.
	 - Implementare le primitive equivalenti ai comandi C64 necessari, come `PRINT` e `POKE`, evitando simulazioni generiche non utilizzate.
	 - Verificare il renderer con bitmap note e confrontare pixel, coordinate e colori prima di collegarlo alla logica del gioco.

 7. **Stato e interprete dei comandi**
	 - Modellare esplicitamente posizione, inventario, oggetti, flag, punteggio e condizioni di gioco presenti nel sorgente.
	 - Implementare l'interprete del formato `VERBO + SOGGETTO`, inclusi comandi validi, input vuoto, input incompleto e comandi sconosciuti.
	 - Collegare ogni comando a una transizione di stato deterministica e a un messaggio coerente con l'originale.
	 - Aggiungere test per parser e transizioni quando la struttura del progetto lo consente.

 8. **Conversione completa del gioco**
	 - Tradurre progressivamente tutte le routine del sorgente, mantenendo il collegamento con la mappa definita negli step 1 e 2.
	 - Evitare `GOTO`, attese bloccanti e variabili globali sparse.
	 - Implementare la funzione `main` o equivalente per inizializzare stato e renderer e avviare il ciclo di gioco.
	 - Non considerare conclusa la conversione finche non sono coperti i principali percorsi, eventi e condizioni di uscita dell'originale.

 9. **Stile e verifica finale**
	 - Aggiungere un CSS minimale e responsive senza alterare la risoluzione logica o le proporzioni del canvas.
	 - Provare il gioco dall'avvio, usando comandi validi e non validi, e controllare console, testi, colori, cursore e sequenza degli eventi.
	 - Verificare JSON, assenza di errori JavaScript e funzionamento su viewport grandi e piccoli.
	 - Aggiornare la checklist in `src/prompts/instructions.md` solo dopo aver completato e verificato ogni step.

 ### Regola per ogni richiesta di modifica

 Prima di modificare il codice, indicare quale step si sta svolgendo, quali file sorgente sono coinvolti, quale comportamento si vuole ottenere e quale verifica dimostrera che lo step e completo. Dopo la modifica, eseguire quella verifica prima di passare ad altro. Se una richiesta richiede di saltare uno step, segnalarlo esplicitamente e spiegare il rischio.
