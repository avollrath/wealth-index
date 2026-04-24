import fs from "node:fs/promises";

const DATA_FILE = "top200.json";
const USER_AGENT =
  "PromiVermoegenArchiv/1.0 (https://github.com/avollrath/wealth-index)";
const MIN_LENGTH = 900;
const MAX_LENGTH = 1150;

function normalizeSpaces(value = "") {
  return value.replace(/\s+/g, " ").trim();
}

function sourceLabel(source = "") {
  const parts = source
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 4);

  if (!parts.length) {
    return "öffentliche Auftritte, Medienarbeit und geschäftliche Projekte";
  }
  if (parts.length === 1) return parts[0];
  return `${parts.slice(0, -1).join(", ")} und ${parts.at(-1)}`;
}

function categoryGroup(category = "") {
  const normalized = category.toLowerCase();

  if (normalized.includes("sport")) return "Sport";
  if (normalized.includes("musik")) return "Musik";
  if (
    normalized.includes("influencer") ||
    normalized.includes("youtube") ||
    normalized.includes("streaming")
  ) {
    return "Social Media";
  }
  if (normalized.includes("comedy")) return "Comedy";
  if (
    normalized.includes("tv") ||
    normalized.includes("film") ||
    normalized.includes("model") ||
    normalized.includes("mode") ||
    normalized.includes("reality")
  ) {
    return "TV & Film";
  }

  return "Weitere";
}

function fallbackRole(category = "") {
  switch (categoryGroup(category)) {
    case "Sport":
      return "Persönlichkeit aus dem Sport";
    case "Musik":
      return "Person aus der Musikszene";
    case "Comedy":
      return "Comedy- und Medienperson";
    case "Social Media":
      return "Social-Media-Persönlichkeit";
    case "TV & Film":
      return "TV- und Medienperson";
    default:
      return "bekannte öffentliche Person";
  }
}

function cleanDescription(description = "", category = "") {
  const disallowed =
    /(begriff|wikimedia|vorname|familienname|liste|begriffsklärung)/i;
  if (!description || disallowed.test(description)) {
    return fallbackRole(category);
  }

  let cleaned = normalizeSpaces(description)
    .replace(/\s*\([^)]*\)/g, "")
    .replace(/Choreograph/g, "Choreograf")
    .replace(/ und Nuklearökologe/gi, "")
    .replace(/, Nuklearökologe/gi, "")
    .replace(/und-spieler/gi, "und -spieler")
    .replace(/Formel 1/gi, "Formel-1")
    .replace(/Formel-1 Rennfahrer/gi, "Formel-1-Rennfahrer")
    .replace(
      /Choreograf, Model, Wertungsrichter/gi,
      "Choreograf, Model und Wertungsrichter",
    );

  cleaned = cleaned.replace(/^[A-ZÄÖÜ]/, (letter) => letter.toLowerCase());
  return cleaned || fallbackRole(category);
}

function sceneParagraph(name, group, category) {
  const lines = {
    Sport: `${name} steht hier für Sport, Leistung und eine öffentliche Marke, die über einzelne Ergebnisse hinaus wirkt. Sichtbarkeit entsteht durch Wettbewerbe, Vereine, Sponsoren und Fans.`,
    Musik: `${name} wird hier als Teil der Musiklandschaft gelesen. Songs, Bühnenpräsenz, Rechte, Tourneen und Wiedererkennbarkeit prägen die öffentliche Einordnung.`,
    "TV & Film": `${name} gehört zur Fernseh-, Film- oder Modeöffentlichkeit. Sichtbarkeit entsteht durch Formate, Rollen, Moderation, Produktion und Markenauftritte.`,
    Comedy: `${name} steht für Comedy, Bühne und mediale Präsenz. Neben Shows zählen Tourneen, Bücher, TV-Formate, Podcasts und eine wiedererkennbare Stimme.`,
    "Social Media": `${name} ist Teil einer Medienwelt, in der Reichweite über Plattformen, Communitys und eigene Produkte entsteht. Aufmerksamkeit und Markenfit sind hier besonders wichtig.`,
    Weitere: `${name} wird hier als öffentliche Persönlichkeit mit eigener Nische geführt. Bekanntheit entsteht oft aus Medien, Unternehmertum, Bühne oder Markenarbeit.`,
  };

  return `${lines[group]} Kategorie im Datensatz: ${category}.`;
}

async function fetchWikiContext(name) {
  const searchUrl = new URL("https://de.wikipedia.org/w/api.php");
  searchUrl.search = new URLSearchParams({
    action: "query",
    list: "search",
    srsearch: name,
    srlimit: "1",
    format: "json",
    origin: "*",
  }).toString();

  const searchResponse = await fetch(searchUrl, {
    headers: { "User-Agent": USER_AGENT },
  });
  if (!searchResponse.ok) return {};

  const searchData = await searchResponse.json();
  const title = searchData?.query?.search?.[0]?.title;
  if (!title) return {};

  const summaryUrl = `https://de.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  const summaryResponse = await fetch(summaryUrl, {
    headers: { "User-Agent": USER_AGENT },
  });
  if (!summaryResponse.ok) return { title };

  const summary = await summaryResponse.json();
  return {
    title,
    description: normalizeSpaces(summary.description || ""),
  };
}

function buildBio(person, context) {
  const name = person.name || "Diese Person";
  const category = person.category || "öffentliche Person";
  const country = person.countryConnection || "Deutschland";
  const estimate = person.estimatedNetWorthEur || "keine öffentliche Schätzung";
  const confidence = person.estimateConfidence || "nicht genauer eingeordnet";
  const shortBio = normalizeSpaces(
    person.shortBio || `${name} ist eine bekannte Persönlichkeit.`,
  );
  const source = sourceLabel(person.wealthSource);
  const role = cleanDescription(context.description, category);
  const group = categoryGroup(category);

  const paragraphs = [
    `${name} ist im Promi Vermögen Archiv als ${role} eingeordnet. ${shortBio} Der Fokus liegt auf Laufbahn, öffentlicher Wahrnehmung und wirtschaftlicher Relevanz.`,
    sceneParagraph(name, group, category),
    `Der Bezug im Datensatz ist ${country}. Das ist eine vereinfachte redaktionelle Zuordnung: Wo ist ${name} sichtbar, wo wurde die Karriere geprägt, und in welchem Markt taucht der Name oft auf?`,
    `Beim geschätzten Vermögen nennt der Datensatz ${estimate}. Diese Zahl ist ein öffentlicher Schätzbereich und kein geprüfter Kontostand. Die Sicherheit ist als ${confidence} markiert; der Wert bleibt grobe Orientierung.`,
    `Als mögliche Einnahmefelder werden vor allem ${source} genannt. Je nach Person können auch Rechte, Werbung, Live-Auftritte, Produktionsarbeit oder eigene Marken eine Rolle spielen. Das Profil trennt Bekanntheit klar von belegbaren Finanzdaten.`,
  ];

  let bio = paragraphs.map(normalizeSpaces).join("\n\n");

  if (bio.length < MIN_LENGTH) {
    const expanded = `${paragraphs[4]} Die tatsächlichen Vermögensverhältnisse können deutlich abweichen, weil private Verträge, Ausgaben, Steuern, Managementstrukturen und Beteiligungen öffentlich meist nicht vollständig sichtbar sind.`;
    paragraphs[4] = expanded;
    bio = paragraphs.map(normalizeSpaces).join("\n\n");
  }

  if (bio.length > MAX_LENGTH) {
    paragraphs[4] = `Als mögliche Einnahmefelder werden vor allem ${source} genannt. Das Profil bleibt redaktionell: Es beschreibt öffentliche Bekanntheit und wirtschaftliche Hinweise, aber keine verifizierten Finanzdaten.`;
    bio = paragraphs.map(normalizeSpaces).join("\n\n");
  }

  return bio;
}

const dataset = JSON.parse(await fs.readFile(DATA_FILE, "utf8"));
let found = 0;

for (const person of dataset.people) {
  const context = await fetchWikiContext(person.name);
  if (context.description) found += 1;
  person.longBio = buildBio(person, context);
}

await fs.writeFile(DATA_FILE, `${JSON.stringify(dataset, null, 2)}\n`, "utf8");

console.log(
  `Added five-paragraph longBio to ${dataset.people.length} entries.`,
);
console.log(`Wikipedia context found for ${found} entries.`);
