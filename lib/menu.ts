export type Diet = "veg" | "nonveg";
export type Tag = "vegan" | "gf" | "nuts" | "spicy" | "egg" | "zero";

export type MenuItem = {
  name: string;
  description: string;
  price: number;
  diet?: Diet;
  tags?: Tag[];
  signature?: boolean;
};

export type MenuCategory = {
  id: string;
  label: string;
  intro: string;
  items: MenuItem[];
};

export const tagLabels: Record<Tag, { short: string; long: string }> = {
  vegan: { short: "VG", long: "Vegan" },
  gf: { short: "GF", long: "Gluten-free" },
  nuts: { short: "N", long: "Contains nuts" },
  spicy: { short: "Hot", long: "Spicy" },
  egg: { short: "E", long: "Contains egg" },
  zero: { short: "0%", long: "Zero proof" },
};

export const menu: MenuCategory[] = [
  {
    id: "small-plates",
    label: "Small plates",
    intro: "To start, to share, to order twice. Most of these see the coals for a minute or less.",
    items: [
      {
        name: "Charred corn ribs",
        description: "Smoked chilli butter, lime, kokum salt",
        price: 420,
        diet: "veg",
        tags: ["gf", "spicy"],
      },
      {
        name: "Ember-roasted beetroot",
        description: "Hung curd, burnt honey, toasted walnut, dill",
        price: 460,
        diet: "veg",
        tags: ["gf", "nuts"],
      },
      {
        name: "Crisp bombil",
        description: "Kolhapuri spice, green mango, smoked garlic mayo",
        price: 540,
        diet: "nonveg",
        tags: ["egg", "spicy"],
        signature: true,
      },
      {
        name: "Smoked burrata",
        description: "Ash-roasted tomato, curry leaf oil, grilled sourdough",
        price: 690,
        diet: "veg",
      },
      {
        name: "Wild mushroom toast",
        description: "Miso butter, pickled shallot, chives",
        price: 480,
        diet: "veg",
      },
      {
        name: "Tiger prawns, koliwada",
        description: "Coal-kissed, lime leaf aioli, pickled onion",
        price: 820,
        diet: "nonveg",
        tags: ["gf", "egg"],
      },
    ],
  },
  {
    id: "from-the-fire",
    label: "From the fire",
    intro: "Larger plates cooked over babool and mango wood. Built for the middle of the table.",
    items: [
      {
        name: "Coal-roasted pomfret",
        description: "Green masala, charred lemon, ember-wilted greens",
        price: 1450,
        diet: "nonveg",
        tags: ["gf"],
        signature: true,
      },
      {
        name: "Lamb seekh",
        description: "Smoked raita, onion petals, ulta tawa paratha",
        price: 980,
        diet: "nonveg",
      },
      {
        name: "Half chicken, Kashmiri chilli",
        description: "Twenty-four hour brine, garlic toum, grilled onion",
        price: 1150,
        diet: "nonveg",
        tags: ["gf", "spicy"],
      },
      {
        name: "Hearth-roasted cauliflower",
        description: "Tahini, pomegranate, pistachio dukkah",
        price: 720,
        diet: "veg",
        tags: ["vegan", "gf", "nuts"],
      },
      {
        name: "Fire-blistered paneer",
        description: "Makhani glaze, fenugreek, wood-fired flatbread",
        price: 790,
        diet: "veg",
      },
      {
        name: "Pork belly, kokum glaze",
        description: "Jaggery, raw papaya slaw, toasted sesame",
        price: 1180,
        diet: "nonveg",
        tags: ["gf"],
      },
    ],
  },
  {
    id: "drinks",
    label: "Drinks",
    intro:
      "A short list of house cocktails, Indian spirits and zero-proof pours. The bar keeps going after the kitchen closes.",
    items: [
      {
        name: "Smoke & Kokum",
        description: "Mezcal, kokum, chilli salt, lime",
        price: 850,
        tags: ["spicy"],
        signature: true,
      },
      {
        name: "Bandra Old Fashioned",
        description: "Indian single malt, jaggery, smoked orange bitters",
        price: 950,
      },
      {
        name: "Ember Spritz",
        description: "Bitter aperitivo, charred grapefruit, sparkling wine",
        price: 780,
      },
      {
        name: "Feni Sour",
        description: "Cashew feni, lime, egg white, nutmeg",
        price: 820,
        tags: ["egg"],
      },
      {
        name: "Smoked Jamun Cooler",
        description: "Jamun, smoked salt, black lemon, soda",
        price: 380,
        tags: ["zero"],
      },
      {
        name: "Kokum & Ginger Fizz",
        description: "Kokum, fresh ginger, lime, tonic",
        price: 360,
        tags: ["zero"],
      },
    ],
  },
  {
    id: "desserts",
    label: "Desserts",
    intro: "Finished in the embers, or as close to them as a dessert can get.",
    items: [
      {
        name: "Burnt Basque cheesecake",
        description: "Alphonso mango when in season, salted caramel",
        price: 620,
        diet: "veg",
        tags: ["egg"],
        signature: true,
      },
      {
        name: "Coal-roasted banana",
        description: "Jaggery caramel, coconut ice cream, sesame",
        price: 480,
        diet: "veg",
        tags: ["vegan", "gf"],
      },
      {
        name: "Smoked chocolate pot",
        description: "Sea salt, olive oil, toasted sourdough crumb",
        price: 560,
        diet: "veg",
        tags: ["egg"],
      },
      {
        name: "Smoked kulfi",
        description: "Pistachio, rose, charred fig",
        price: 450,
        diet: "veg",
        tags: ["gf", "nuts"],
      },
    ],
  },
];

export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN").format(price);
}
