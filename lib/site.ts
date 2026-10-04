export const site = {
  name: "Ember",
  title: "Ember — Kitchen & Bar, Bandra West",
  description:
    "Ember is a concept wood-fire restaurant and bar in Bandra West, Mumbai: small plates, food cooked over babool and mango wood, and late pours. Designed and built by GLAZY.",
  url: "https://ember-glazy.vercel.app",
  studio: {
    name: "GLAZY",
    url: "https://glazy-portfolio.vercel.app",
  },
  address: {
    street: "Concept address",
    area: "Ranwar, Bandra West",
    city: "Mumbai 400050",
  },
  coordinates: "19.0544° N, 72.8302° E",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Ranwar+Village+Bandra+West+Mumbai",
} as const;

export const nav = [
  { href: "#menu", label: "Menu" },
  { href: "#story", label: "The fire" },
  { href: "#reserve", label: "Reserve" },
  { href: "#visit", label: "Visit" },
] as const;
