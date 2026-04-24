import dataset from "../../top200.json";

export type Person = {
  rank?: number;
  id?: string;
  name?: string;
  category?: string;
  countryConnection?: string;
  estimatedNetWorthEur?: string;
  estimateConfidence?: string;
  shortBio?: string;
  wealthSource?: string;
  websiteUsageNote?: string;
};

export const metadata = dataset.metadata;

export const people = (dataset.people as Person[])
  .filter((person) => person?.id && person?.name)
  .sort((a, b) => (a.rank ?? 9999) - (b.rank ?? 9999));

export const categoryGroups = [
  "Sport",
  "Musik",
  "TV & Film",
  "Social Media",
  "Comedy",
  "Weitere",
] as const;

export function getCategoryGroup(category?: string) {
  const normalized = (category || "").toLowerCase();

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

export function formatRank(rank?: number) {
  return typeof rank === "number" ? `#${rank}` : "ohne Rang";
}

export function getPersonById(id: string) {
  return people.find((person) => person.id === id);
}

export function getRelatedPeople(current: Person, limit = 4) {
  const sameCategory = people.filter(
    (person) =>
      person.id !== current.id && person.category === current.category,
  );
  const nearby = people
    .filter(
      (person) =>
        person.id !== current.id && person.category !== current.category,
    )
    .sort(
      (a, b) =>
        Math.abs((a.rank ?? 9999) - (current.rank ?? 9999)) -
        Math.abs((b.rank ?? 9999) - (current.rank ?? 9999)),
    );

  const merged = [...sameCategory, ...nearby];
  const unique = new Map(merged.map((person) => [person.id, person]));
  return Array.from(unique.values()).slice(0, limit);
}

export function estimateLabel(value?: string) {
  return value || "Keine öffentliche Schätzung";
}
