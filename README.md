# PROMI-VERMOGENS-INDEX

Eine editoriale Astro-Site fuer ein deutsches Promi-Archiv mit groben Vermoegensschaetzungen, klarer Typografie und einer bewusst bildfreien Gestaltung. Statt Portraits gibt es Aura-Flaechen, grosse Headlines und eine Liste, die sich eher wie ein Magazinindex als wie ein Dashboard anfuehlt.

![PROMI-VERMOGENS-INDEX Vorschau](public/readme/promi-index-preview.jpg)

> Kein Finanztool, kein Gossip-Ticker, kein "CEO-Ranking". Eher ein digitaler Katalog fuer bekannte Namen, oeffentliche Wahrnehmung und grob eingeschaetzte wirtschaftliche Groessenordnungen.

## Was die Seite kann

- durchsuchen, filtern und sortieren
- fuer alle 200 Eintraege eigene Profilseiten erzeugen
- verwandte Profile auf Basis von Kategorie und Rang zeigen
- auf Desktop und Mobile sauber lesbar bleiben
- komplett ohne Fotos, Stockbilder oder externe Bild-Assets auskommen

## Was hier besonders ist

- Typografie zuerst: grosse Headlines, klare Raster, wenig Deko
- Aura-Look statt Bilder: weiche Verlaeufe, Koernung und warme Akzente nur per CSS
- Daten direkt aus `top200.json`, keine haendisch gepflegte Personenliste
- deutsche UI-Texte, Methodik-Seite und defensive Datenbehandlung

## Kurz zur Datenbasis

Alle Vermoegenswerte auf der Seite sind grobe oeffentliche Schaetzungen. Sie sind keine verifizierten Finanzdaten, keine Kontoauszuege und keine belastbaren Abschluesse. Die Rangfolge ist deshalb immer nur eine redaktionelle Annaeherung.

## Lokal starten

```bash
npm install
npm run dev
```

Danach laeuft die Seite in der Regel unter `http://127.0.0.1:4321/`.

## Build

```bash
npm run build
```

Der fertige Output landet in `dist/`.

## Woraus das Projekt besteht

- `Astro` fuer Routing und statische Seiten
- `TypeScript` fuer die Datennutzung
- `CSS` mit Custom Properties fuer Layout und Look
- `top200.json` als zentrale Datenquelle

## Deployment

Die Seite ist statisch und laesst sich unkompliziert auf GitHub Pages, Netlify, Vercel oder anderem Static Hosting veroeffentlichen. Die Grundkonfiguration fuer GitHub Pages ist im Projekt bereits vorbereitet.

## Ideen fuer spaeter

- sauberer ueberarbeitete Biografien fuer alle 200 Profile
- feinere Filter fuer Laenderbezug und Schaetzsicherheit
- kleine redaktionelle Specials wie "ueberraschende Nachbarschaften" oder Vergleiche
- visuelle Snapshots fuer Regressionstests

## Hinweis

Wenn du das Projekt lokal oeffnest und etwas komisch wirkt, ist fast immer zuerst ein Blick auf `npm run build` oder `npm run dev` hilfreich. Die Seite ist bewusst statisch gehalten, also eher angenehm robust als ueberengineert.
