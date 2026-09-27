# Haltbar

Meine private Handy-App für Lebensmittel: eintragen, was im Kühlschrank und Vorrat ist, und auf einen Blick sehen, wie lange es noch haltbar ist („Noch 5 Tage“).

**App öffnen:** https://veenex.github.io/haltbar/

## Was sie kann

- Liste nach Ablaufdatum sortiert: *Abgelaufen*, *Läuft bald ab* (0–3 Tage), *Noch haltbar*
- Farbige Anzeige neben jedem Eintrag: „Noch heute“, „Noch 5 Tage“, „Abgelaufen“
- Bilder kommen automatisch passend zum Namen (über 1.000 deutsche Begriffe, z. B. „Hähnchenbrust“, „Erdbeerjoghurt“); per Tipp lässt sich ein anderes wählen, die App merkt sich das
- Schnellauswahl fürs Datum (Morgen, +3 Tage, +1 Woche …) und Vorschläge beim Tippen
- Nach links wischen = aufgebraucht, mit „Rückgängig“
- „Was koche ich heute?“: rund 90 eigene Alltagsrezepte (für 2 Personen), sortiert danach, was zuerst weg muss; Filter nach Lebensmittel, Links zu Chefkoch für mehr Ideen
- Funktioniert offline und lässt sich auf den Startbildschirm legen
- Fürs Handy gebaut, ohne Zoomen

## Datenschutz

Die Einträge werden nur im Speicher des Browsers auf dem eigenen Gerät abgelegt – nicht in diesem Repository und auf keinem Server. Wer die Adresse öffnet, sieht eine leere, eigene Liste. Über „Sicherung speichern/laden“ (Menü oben rechts) lassen sich die Daten als Datei sichern oder auf ein neues Handy mitnehmen.

## Technik

Reines HTML/CSS/JavaScript ohne Build-Schritt, gehostet mit GitHub Pages. Nach Änderungen an App-Dateien die Versionsnummer in `sw.js` (`VERSION`, `ASSET_V`) und die `?v=`-Angaben in `index.html` erhöhen, damit Handys die neue Version laden.

Neue Bilder: Eintrag in `foods.js` ergänzen, dann `python tools/build_icons.py food <schlüssel>` (braucht Pillow und numpy). Bilder, die es bei Fluent nicht gibt, werden in `tools/custom_icons.py` selbst gezeichnet (Ordner `eigen` in `foods.js`).

Rezepte stehen in `recipes.js`; jede Zutat hat eine Erkennung, über die die App sieht, was davon schon da ist.

## Bilder

Lebensmittel-Bilder: [Fluent Emoji](https://github.com/microsoft/fluentui-emoji) von Microsoft, MIT-Lizenz (siehe `food/LICENSE`). Das Aufschnitt-Bild ist selbst gezeichnet.
