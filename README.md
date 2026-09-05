# Magic_angel

Sito web "Magic Angel" realizzato per il corso regionale.

## Avviare il sito in locale

Per avviare un semplice web server locale:

```bash
./avvia_sito.py
```

Quando avvii il software comparirà così:

```
--- Server Web Attivo ---
-> Locale:  http://localhost:8000
-> In rete: http://192.168.1.65:8000
Premi Ctrl+C per arrestare.
```

Apri il link "Locale" nel browser per vedere il sito.

## Scaricare il repository da GitHub

Per scaricare (cliccare) una copia del progetto:

```bash
python3 scarica_repo.py
```

Il progetto verrà copiato nella cartella `Magic_angel`. Puoi scegliere un'altra cartella con `-d nome_cartella`.

Per i principianti: se la cartella di destinazione esiste già, lo script si ferma per non sovrascrivere nulla.

## Struttura del progetto

| File | Cosa fa |
|------|---------|
| `index.html` | Home page del sito |
| `prodotto.html` | Pagina del prodotto |
| `spot.html`, `radio-spot.html` | Pagine dedicate agli spot |
| `costi.html`, `opinioni.html`, `faq.html`, `contatti.html`, `social.html` | Altre pagine del sito |
| `style.css` | Stile e grafica del sito |
| `script.js` | Interazione e comportamento della pagina |
| `config.json` | Configurazione del sito |
| `avvia_sito.py` | Avvia il web server locale |
| `scarica_repo.py` | Scarica il progetto da GitHub |
| `REFERENCE/` | Immagini e materiali di riferimento |
