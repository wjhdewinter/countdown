# Final Countdown PRO v4 — GitHub Pages Fixed

Deze versie is speciaal gefixt voor:

https://wjhdewinter.github.io/Test/

## Wat is gefixt

- App-icoon werkt via `/Test/icons/...`
- Manifest werkt via `/Test/manifest.json`
- Service worker werkt via `/Test/sw.js`
- Cache-busting toegevoegd aan CSS en JS
- Oude cache wordt automatisch verwijderd
- Blauwe detailknop is verwijderd
- Installatieknop blijft zichtbaar
- Android en iPhone ondersteuning toegevoegd
- Maskable icons toegevoegd voor mooi Android app-icoon

## Uploaden naar GitHub

Upload de inhoud van deze ZIP direct in je repository `Test`.

De structuur moet zo zijn:

```text
index.html
style.css
app.js
manifest.json
sw.js
icons/
  icon-192.png
  icon-512.png
  maskable-192.png
  maskable-512.png
README.md
```

## Belangrijke testlinks

Na uploaden moeten deze links werken:

- https://wjhdewinter.github.io/Test/manifest.json
- https://wjhdewinter.github.io/Test/icons/icon-192.png
- https://wjhdewinter.github.io/Test/icons/icon-512.png

## Android installeren

1. Verwijder eerst de oude app van je beginscherm.
2. Open Chrome.
3. Ga naar https://wjhdewinter.github.io/Test/
4. Tik 2x op vernieuwen.
5. Tik op **App installeren** of kies in Chrome-menu **Toevoegen aan startscherm**.

## iPhone installeren

1. Open de site in Safari.
2. Tik op delen.
3. Kies **Zet op beginscherm**.
