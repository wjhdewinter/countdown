# Final Countdown PRO v6 — Hard Reset Debug Fix

Deze versie doet automatisch eenmalig:
- oude service workers verwijderen
- oude PWA caches verwijderen
- pagina opnieuw laden met `?fresh=v6`

Daarna registreert hij een nieuwe service worker met scope `./`.

## Uploaden

Verwijder eerst alle oude bestanden uit je GitHub repo `Test`.
Upload daarna deze bestanden in de root van de repo:

- index.html
- style.css
- app.js
- manifest.webmanifest
- sw.js
- icons map

## Android Chrome

Open:
https://wjhdewinter.github.io/Test/?fresh=v6

Wacht 10-30 seconden. Chrome toont dan meestal:
- knop App installeren
- of menu > App installeren

Als Chrome nog geen knop toont, gebruik:
Chrome-menu > Toevoegen aan startscherm.
