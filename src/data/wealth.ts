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

export const categories = Array.from(
  new Set(people.map((person) => person.category).filter(Boolean)),
).sort((a, b) => String(a).localeCompare(String(b), "de"));

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
