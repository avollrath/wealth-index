# Promi Vermögen Archiv / Wealth Index

Eine deutsche, typografiebetonte Website für ein redaktionelles Archiv bekannter Persönlichkeiten und ihrer grob geschätzten wirtschaftlichen Reichweite. Das Projekt nutzt die bereitgestellte `top200.json` direkt und erzeugt daraus eine durchsuchbare Übersicht sowie Detailseiten für alle Profile.

## Screenshot

Platzhalter für Screenshots der Startseite, Detailseite und mobilen Ansicht.

## Features

- Durchsuchbarer Index mit allen 200 Einträgen
- Kategorie-Filter aus den vorhandenen Daten
- Sortierung nach Rang auf- und absteigend
- "Mehr laden"-Interaktion für lange Listen
- Statische Detailseite für jede Person über `person.id`
- Verwandte Profile nach Kategorie mit Rang-Fallback
- Methodik-Seite mit klarem Daten-Disclaimer
- Responsive Layouts für Desktop, Tablet und Mobile
- Keine Fotos, Portraits, generierten Gesichter oder externen Bildassets
- Aura-Panels ausschließlich über CSS-Verläufe und dezente Körnung

## Tech Stack

- Astro
- TypeScript
- Vanilla JavaScript für die Index-Interaktionen
- CSS mit Custom Properties
- Datenquelle: `top200.json`

## Datenhinweis

Alle Vermögenswerte sind grobe öffentliche Schätzbereiche. Sie sind keine verifizierten Finanzdaten, keine Finanzabschlüsse und keine exakten Vermögensangaben. Die Rangfolge ist approximativ und dient ausschließlich der informations- und redaktionell orientierten Darstellung.

## Lokale Entwicklung

```bash
npm install
npm run dev
```

Die lokale Entwicklungsseite läuft standardmäßig unter `http://127.0.0.1:4321/`.

## Build

```bash
npm run build
```

Der Produktionsbuild wird in `dist/` erzeugt.

## Deployment

Das Projekt ist als statische Astro-Site angelegt und kann auf GitHub Pages, Netlify, Vercel oder jedem statischen Hosting deployed werden. In `astro.config.mjs` ist die Site-URL für GitHub Pages vorbereitet.

## Mögliche Verbesserungen

- Feineres Ranking- und Quellenmodell mit redaktionellen Notizen
- Zusätzliche Filter nach Länderbezug oder Schätzsicherheit
- Vergleichsansicht für mehrere Profile
- Automatisierte visuelle Regressionstests für die Aura-Komponenten
- Mehrsprachige Metadaten für internationale Varianten
