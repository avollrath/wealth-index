import fs from "node:fs/promises";

const DATA_FILE = "top200.json";
const USER_AGENT =
  "PromiVermoegenArchiv/1.0 (https://github.com/avollrath/wealth-index)";
const MIN_LENGTH = 200;
const MAX_LENGTH = 300;

function normalizeSpaces(value = "") {
  return value.replace(/\s+/g, " ").trim();
}

function trimToLength(value, maxLength = MAX_LENGTH) {
  const text = normalizeSpaces(value);
  if (text.length <= maxLength) return text;
  const hardLimit = text.slice(0, maxLength + 1);
  const sentenceEnd = Math.max(
    hardLimit.lastIndexOf("."),
    hardLimit.lastIndexOf("!"),
    hardLimit.lastIndexOf("?"),
  );

  if (sentenceEnd >= MIN_LENGTH)
    return hardLimit.slice(0, sentenceEnd + 1).trim();

  const wordEnd = hardLimit.lastIndexOf(" ");
  return hardLimit.slice(0, wordEnd > MIN_LENGTH ? wordEnd : maxLength).trim();
}

function sourceLabel(source = "") {
  const parts = source
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 3);

  if (!parts.length)
    return "öffentliche Auftritte, Medienarbeit und geschäftliche Projekte";
  if (parts.length === 1) return parts[0];
  return `${parts.slice(0, -1).join(", ")} und ${parts.at(-1)}`;
}

function fallbackRole(category = "") {
  const normalized = category.toLowerCase();

  if (normalized.includes("sport")) return "Persönlichkeit aus dem Sport";
  if (normalized.includes("musik")) return "Person aus der Musikszene";
  if (normalized.includes("comedy")) return "Comedy- und Medienperson";
  if (normalized.includes("influencer") || normalized.includes("youtube")) {
    return "Social-Media-Persönlichkeit";
  }
  if (normalized.includes("tv") || normalized.includes("film"))
    return "TV- und Medienperson";
  if (normalized.includes("model") || normalized.includes("mode"))
    return "Mode- und Medienperson";

  return "bekannte öffentliche Person";
}

function cleanDescription(description = "", category = "") {
  const disallowed =
    /(begriff|wikimedia|vorname|familienname|liste|begriffsklärung)/i;
  if (!description || disallowed.test(description))
    return fallbackRole(category);

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
    extract: normalizeSpaces(summary.extract || ""),
  };
}

function buildBio(person, context) {
  const name = person.name || "Diese Person";
  const category = person.category || "öffentliche Person";
  const country = person.countryConnection || "Deutschland";
  const role = cleanDescription(context.description, category);
  const shortBio = normalizeSpaces(
    person.shortBio || `${name} ist eine bekannte Persönlichkeit.`,
  );
  const source = sourceLabel(person.wealthSource);

  const bio = [
    shortBio,
    `Öffentlich wird ${name} meist als ${role} beschrieben.`,
    `Im Archiv gehört das Profil zu ${category} mit Bezug zu ${country}.`,
    `Mögliche Einnahmefelder: ${source}.`,
  ].join(" ");

  const enriched =
    bio.length >= MIN_LENGTH
      ? bio
      : `${bio} Die Einordnung bleibt bewusst kompakt und trennt biografische Bekanntheit von groben Vermögensschätzungen.`;

  return trimToLength(enriched);
}

const dataset = JSON.parse(await fs.readFile(DATA_FILE, "utf8"));
let found = 0;

for (const person of dataset.people) {
  const context = await fetchWikiContext(person.name);
  if (context.description || context.extract) found += 1;
  person.longBio = buildBio(person, context);
}

await fs.writeFile(DATA_FILE, `${JSON.stringify(dataset, null, 2)}\n`, "utf8");

console.log(`Added longBio to ${dataset.people.length} entries.`);
console.log(`Wikipedia context found for ${found} entries.`);
