# Prompt per NanoBanana Pro - Generazione Icone SVG Food Safety

## CONTESTO
Sto costruendo un sistema di sicurezza alimentare per menu digitali. Ho già 39 icone professionali SVG (Erudus Icons) e mi servono altre 14 icone nello stesso identico stile.

## STRUTTURA TECNICA RICHIESTA

Ogni icona DEVE seguire questo formato esatto:

```xml
<?xml version="1.0" encoding="utf-8"?>
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <g>
    <!-- Il contenuto dell'icona va qui (path, circle, rect, ecc.) -->
  </g>
  <!-- QUESTO PATH DEL CERCHIO È OBBLIGATORIO E IDENTICO PER TUTTE LE ICONE -->
  <path d="M32,3c16,0,29,13,29,29S48,61,32,61S3,48,3,32S16,3,32,3 M32,0C14.3,0,0,14.3,0,32s14.3,32,32,32s32-14.3,32-32S49.7,0,32,0 L32,0z"/>
</svg>
```

**Punti chiave:**
- ViewBox: `0 0 64 64` (FISSO)
- Contenuto: dentro un tag `<g>...</g>`
- Cerchio esterno: path identico per tutte (copia-incolla l'ultima linea)
- Colore: SOLO nero (#000) su sfondo trasparente
- Stile: Linee pulite, forme geometriche, minimalista

## ESEMPI DI ICONE ESISTENTI

### Esempio 1: Gluten (Grano)
```xml
<?xml version="1.0" encoding="utf-8"?>
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<g>
	<path d="M23,36.2h7.9v4.5c-1,0.8-2.3,1.5-3.7,2.1c-1.4,0.6-2.9,0.9-4.3,0.9c-2.9,0-5.3-1-7-3.1c-1.8-2.1-2.7-5.2-2.7-9.4
		c0-3.9,0.9-6.8,2.7-8.7c1.8-2,4.2-2.9,7.2-2.9c2,0,3.6,0.5,5,1.5c1.3,1,2.2,2.4,2.7,4.1l6.8-1.3c-0.7-3.2-2.2-5.8-4.6-7.6
		c-2.4-1.8-5.7-2.7-9.9-2.7c-3.2,0-6,0.6-8.1,1.7c-2.9,1.5-5,3.7-6.5,6.5S6,27.7,6,31.4c0,3.4,0.7,6.5,2,9.3c1.3,2.9,3.3,5.1,6,6.6
		c2.6,1.5,5.7,2.3,9.3,2.3c2.8,0,5.6-0.5,8.3-1.6c2.7-1.1,4.8-2.4,6.2-3.8v-14H23V36.2z"/>
	<path d="M52.1,40.8c-1,0.4-1.9,0.8-2.8,1.3c0.5-1.7,0.8-3.4,1.1-5.1c0.5,0.3,1.1,0.5,1.9,0.3c0.8-0.2,1.5-0.6,2.1-1.1
		c2.7-2.4,3.5-5.5,3.1-9.1c-1.3,2.3-3.6,3.4-5.8,4.7c-0.4,0.2-0.7,0.5-1,0.9c0-1.1,0-2.2-0.1-3.3c1.2,0.7,2.2,0.5,3.1-0.6
		c2.2-2.7,1-9.8-2.2-12c0.3,2.8-1,5.1-1.9,7.6c-0.2-0.7-0.5-1.4-0.8-2.1c0.5-0.8,0.5-1.9-0.1-3.3c-1.2-2.3-3.4-3.9-4.3-6.9
		c-1.6,3.7-1.2,6.9,1.2,11c-1.4-0.3-2.1-1.7-3.6-2.5c0,3,0.5,5.7,2.2,8c1.3,1.8,2.8,2.2,3.9,1.2c0.1,1.6,0.1,3.1-0.1,4.6
		c-0.1-0.4-0.3-0.8-0.6-1.1c-0.1-0.2-0.3-0.4-0.5-0.6c-1.7-1.4-3.5-2.8-5.3-4.7c-0.2,3.2,0,5.9,1.5,8.3c1,1.7,2.8,2.1,4.1,1.3
		c0.1-0.1,0.2-0.2,0.3-0.3c-0.3,1.3-0.8,3-1.4,4.8c-0.4-0.8-0.9-1.6-1.8-2.2C43.2,39,42,38.1,41,36.7c-0.4-0.6-1-1-1.2,0.1
		c-0.4,3-0.5,5.9,1.5,8.4c1.1,1.4,2.1,1.8,3.2,1.5c-0.4,1-0.7,1.9-1,2.7c-0.3,0.8-0.6,1.8,0.5,2.2c1.2,0.4,1.9-0.3,2.3-1.3
		c0.3-0.8,0.7-1.6,1-2.3c0.8,0.8,1.9,0.8,3.8-0.2c4.2-2.1,6-5.8,6.9-10.7C55.9,38.7,54.1,40.1,52.1,40.8z M45.9,23.4
		c0.5,0,0.9,0,1.3-0.1c0.1,0.6,0.3,1.2,0.4,1.8C46.9,24.6,46.3,24.1,45.9,23.4z"/>
</g>
<path d="M32,3c16,0,29,13,29,29S48,61,32,61S3,48,3,32S16,3,32,3 M32,0C14.3,0,0,14.3,0,32s14.3,32,32,32s32-14.3,32-32S49.7,0,32,0 L32,0z"/>
</svg>
```
**Nota:** Questa icona mostra la lettera "G" + spiga di grano. Dettagli moderati, forma riconoscibile.

### Esempio 2: Peanuts (Arachidi)
```xml
<?xml version="1.0" encoding="utf-8"?>
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<g>
	<g>
		<path d="M39.4,6.3C32.1,5.8,26.7,9.8,25.8,17c-0.7,5.5-2.4,10.5-5.9,14.9c-2.1,2.6-3.4,5.7-4.1,9C14,49.6,21,57.8,30.4,57.7
			c2.1,0.1,4.3-0.5,6.4-1.6c6-3.4,9.6-10.5,8.5-17.3c-0.6-4.1-0.3-8,1.2-11.9c1-2.6,1.8-5.4,2.7-8.1C50.8,13.6,45.6,6.7,39.4,6.3z
			 M36.1,42.3c0.1,1.2-0.5,2.5-1.5,3.6c-0.7,0.8-1.5,1.2-2.3,1.2c0,0-0.1,0-0.1,0c-2.1,0-2.4-1.9-2.4-2.6l0-0.1
			c0-1.3,0.6-2.7,1.6-3.7c0.7-0.7,1.5-1.1,2.3-1.1c0,0,0,0,0,0C34.7,39.7,36,40.2,36.1,42.3z M29.2,32.1c0.7-0.6,1.4-1,2.1-0.9
			c1,0,2.3,0.5,2.4,2.7v0c0,1.4-0.7,2.9-1.8,3.9c-0.6,0.6-1.3,0.9-2,0.9c0,0-0.1,0-0.1,0c-1.1,0-2.4-0.6-2.4-2.9
			C27.5,34.5,28.2,33.1,29.2,32.1z M29.1,42.3c0,1.2-0.7,2.7-1.7,3.7c-0.7,0.7-1.5,1-2.2,1c0,0,0,0-0.1,0c-1,0-2.2-0.5-2.4-2.6
			c-0.1-1.2,0.5-2.6,1.4-3.6c0.7-0.8,1.5-1.2,2.3-1.3c0.7,0,1.3,0.2,1.7,0.7C28.8,40.7,29.1,41.4,29.1,42.3z M22.9,32
			c0.7-0.7,1.6-1,2.3-1c2,0.2,2.2,2,2.2,2.5l0,0c0,1.4-0.7,2.9-1.7,3.9c-0.7,0.6-1.4,1-2.1,1c0,0-0.1,0-0.1,0
			c-0.9,0-2.4-0.5-2.4-2.9C21.2,34.5,21.9,33,22.9,32z M19.5,47.3c-0.1,0-0.1,0-0.2,0c-1.9,0-2.3-1.7-2.5-2.9c0-0.2-0.1-0.4-0.1-0.6
			l0-0.1l0.1-0.6c0.3-1.5,0.6-3.5,2.9-3.6c0.8,0,1.4,0.2,1.9,0.6c0.8,0.8,0.9,2.1,0.9,3C22.5,46.4,20.9,47.2,19.5,47.3z M24.2,54.9
			C24.2,54.9,24.2,54.9,24.2,54.9c-0.8,0-1.5-0.4-2.2-1c-1-1-1.7-2.5-1.7-3.9l0,0c0.1-2.2,1.4-2.6,2.6-2.5c1.8,0.1,3.7,2.4,3.7,4.6
			C26.6,54.3,25.3,54.9,24.2,54.9z M29.8,56.2c0,0-0.1,0-0.1,0c-0.6,0-1.1-0.2-1.5-0.6c-0.5-0.5-0.9-1.3-0.9-2.2v0
			c0-1.3,0.6-2.7,1.6-3.7c0.7-0.7,1.5-1.1,2.2-1.1c0,0,0,0,0,0c1.1,0,2.4,0.5,2.5,2.8C33.7,53.5,31.6,56.2,29.8,56.2z M39.3,50.5
			c-0.7,0.7-1.5,1.1-2.3,1.1c0,0-0.1,0-0.1,0c-1,0-2.2-0.5-2.3-2.4l0,0c0-1.3,0.6-2.8,1.6-3.9c0.7-0.7,1.5-1.1,2.2-1.1c0,0,0,0,0,0
			c1.6,0,2.4,0.9,2.4,2.8C40.9,48.2,40.3,49.5,39.3,50.5z"/>
	</g>
</g>
<path d="M32,3c16,0,29,13,29,29S48,61,32,61S3,48,3,32S16,3,32,3 M32,0C14.3,0,0,14.3,0,32s14.3,32,32,32s32-14.3,32-32S49.7,0,32,0 L32,0z"/>
</svg>
```
**Nota:** Forma organica di arachide con dettagli interni (puntini). Riempie circa 70% del cerchio.

### Esempio 3: Vegan
```xml
<?xml version="1.0" encoding="utf-8"?>
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<path d="M48.5,10.2c0,0-5.2,0.2-6.5,3.5c-1.3,3.2,3,9.4,1.4,10.5c-0.4,0.3-2.5,0.3-2.9,0.6c-0.4,0.3-0.6,0.6-0.7,1l-0.5,1.4
	l-7.4,19.1c-0.5,1.4-1,2.9-1.3,4.7c-0.2-0.9-0.4-1.7-0.7-2.5c-0.2-0.8-0.5-1.5-0.8-2.2l-7.9-20.6c-0.2-0.4-0.4-1.4-0.8-1.7
	C20,23.8,19.5,23,19,23h-5.1l13.6,35h5.7c0,0,10.2-22.8,12.4-30.8c0.2-0.6-1.2-2.5-0.6-3C53.8,16.2,48.5,10.2,48.5,10.2z"/>
<path d="M32,3c16,0,29,13,29,29S48,61,32,61S3,48,3,32S16,3,32,3 M32,0C14.3,0,0,14.3,0,32s14.3,32,32,32s32-14.3,32-32S49.7,0,32,0 L32,0z"/>
</svg>
```
**Nota:** Lettera "V" stilizzata con foglia. Design pulito e moderno.

---

## ICONE DA CREARE

Per favore, crea le seguenti icone SVG seguendo ESATTAMENTE la struttura tecnica degli esempi sopra:

### 🔴 PRIORITÀ ALTA (Allergens)

#### 1. Shellfish (Frutti di mare generici - cozza/vongola)
```
Nome file: circle-shellfish.svg
Descrizione: Una conchiglia stilizzata (tipo cozza o vongola) vista di lato, con linee che indicano le scanalature della conchiglia.
Stile: Forma organica con pattern di linee radiali, riempie 60-70% del cerchio.
```

#### 2. Squid (Calamari)
```
Nome file: circle-squid.svg
Descrizione: Sagoma stilizzata di un calamaro con testa ovale e tentacoli visibili sotto.
Stile: Forma semplificata, 4-6 tentacoli riconoscibili, corpo centrale ovale.
```

#### 3. Shrimp (Gamberetti)
```
Nome file: circle-shrimp.svg
Descrizione: Profilo laterale di un gamberetto con corpo curvo e segmenti visibili della coda.
Stile: Curva a C, 3-4 segmenti coda, antenne frontali.
```

#### 4. Crab (Granchio)
```
Nome file: circle-crab.svg
Descrizione: Vista frontale di un granchio con corpo ovale/rotondo e due chele prominenti ai lati.
Stile: Corpo centrale arrotondato, 2 chele grandi, zampe stilizzate.
```

---

## COME RISPONDERE

Per ogni icona, fornisci:
1. Il codice XML completo pronto da copiare
2. Una breve descrizione di cosa rappresenta
3. Il nome del file suggerito

**Esempio di risposta ideale:**
```
Ecco l'icona Shellfish (circle-shellfish.svg):

[codice XML completo qui]

Questa icona rappresenta una conchiglia stilizzata con 8 linee radiali che partono dal centro, creando l'effetto delle scanalature tipiche delle cozze.
```

---

## NOTE IMPORTANTI

- ✅ ViewBox SEMPRE `0 0 64 64`
- ✅ Cerchio esterno identico (copia l'ultimo `<path>` dagli esempi)
- ✅ Contenuto dentro `<g>...</g>`
- ✅ Solo colore nero, no fill colors, no stroke colors
- ✅ Riconoscibile anche a 20px di dimensione
- ✅ Stile minimalista come gli esempi

Inizia con le prime 4 icone (Shellfish, Squid, Shrimp, Crab) per favore!
