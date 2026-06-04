export const G = "#2D7A4F";
export const GL = "#E8F5EE";
export const GM = "#A8D5B5";
export const W = "#FFFFFF";
export const BG = "#F7F7F5";
export const T = "#1A1A1A";
export const T2 = "#6B7280";
export const BD = "#EAEAEA";
export const RE = "#EF4444";

export const isFeminineName = (prenom) => {
  if (!prenom) return false;
  const normalized = prenom.trim().toLowerCase();
  const femaleNames = ["djamila", "mima", "sara", "amina", "mana", "yasmina", "nadia", "fatima", "salma", "sabine"];
  return femaleNames.includes(normalized) || normalized.endsWith("a") || normalized.endsWith("e");
};
