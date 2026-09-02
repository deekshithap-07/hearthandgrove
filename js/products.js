/* Hearth & Grove — shared product catalogue */
window.HG_PRODUCTS = {
  "cashew-nuts": {
    id: "cashew",
    slug: "cashew-nuts",
    name: "Cashew Nuts",
    price: 12,
    img: "images/cashews.jpg",
    tag: "Premium · Carefully sourced",
    shortDescription:
      "Creamy, mineral-rich cashews — carefully sourced for flavour and everyday nourishment.",
    description:
      "Our cashews are selected for their creamy texture and naturally sweet flavour. Each pack is carefully sourced and packed with intention — a simple handful that feels honest, full of flavour, and easy to trust.",
    about:
      "Cashews offer a creamy, mineral-rich bite and bring zinc and copper — minerals that support skin from the inside out. Enjoy them on their own, with fruit, or as part of a balanced plate.",
    nutrition: {
      serving: "Per 28 g (1 oz) serving",
      energy: "553 kJ / 132 kcal",
      fat: "10.4 g",
      carb: "7.6 g",
      sugars: "1.7 g",
      fibre: "0.9 g",
      protein: "4.3 g",
    },
    images: ["images/cashews.jpg"],
  },
  almonds: {
    id: "almond",
    slug: "almonds",
    name: "Almonds",
    price: 14,
    img: "images/almonds-pile.jpg",
    tag: "Premium · Carefully sourced",
    shortDescription:
      "Naturally rich in vitamin E — premium almonds from the grove, packed with care.",
    description:
      "Our almonds are chosen for their crisp bite and clean, nutty flavour. Premium nuts from the grove — sourced with care and shared with intention.",
    about:
      "Almonds are a natural source of vitamin E. Fibre in almonds especially supports digestive comfort — drink water and enjoy nuts as part of a varied, plant-forward plate.",
    nutrition: {
      serving: "Per 28 g (1 oz) serving",
      energy: "687 kJ / 164 kcal",
      fat: "14.2 g",
      carb: "6.1 g",
      sugars: "1.2 g",
      fibre: "3.5 g",
      protein: "6.0 g",
    },
    images: ["images/almonds-pile.jpg"],
  },
};

window.HG_PRODUCT_BY_ID = Object.fromEntries(
  Object.values(window.HG_PRODUCTS).map((p) => [p.id, p])
);
