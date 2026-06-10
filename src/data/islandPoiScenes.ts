export type IslandPoiAction = {
  label: string;
  href?: string;
  variant?: "primary" | "ghost" | "danger";
  disabled?: boolean;
};

export type IslandPoiScene = {
  id: string;
  zone: string;
  title: string;
  subtitle: string;
  image?: string;
  video?: string;
  poster?: string;
  description: string;
  mood: string;
  objective?: string;
  actions: IslandPoiAction[];
  clues?: string[];
};

export const publicAsset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;

export const ROTAS_STREET_SCENES: Record<string, IslandPoiScene> = {
  eye: {
    id: "eye",
    zone: "Centre de Rotas",
    title: "Rue de la Maison de l’Œil",
    subtitle: "Archives vivantes · Feuch Institut local",
    image: publicAsset("assets/img/rotas/streets/maison-oeil-vertical.png"),
    video: publicAsset("assets/video/rotas/maison-oeil-loop.mp4"),
    description: "Une rue d’escaliers monte vers la grande coupole. Les mosaïques observent autant qu’elles guident, et les lanternes prennent des notes quand personne ne regarde.",
    mood: "pierre chaude, cuivre patiné, eau lointaine, silence de bibliothèque-ruche",
    objective: "Ouvrir le registre des anomalies et préparer l’accès Aloisia.",
    actions: [
      { label: "Entrer dans la Maison de l’Œil", disabled: true },
      { label: "Consulter les archives", disabled: true },
    ],
    clues: ["Œil gravé dans la mosaïque", "Escaliers vers les salles hautes", "Possible terminal Aloisia"],
  },
  tea: {
    id: "tea",
    zone: "Centre de Rotas",
    title: "Passage du Salon de thé",
    subtitle: "Terrasse, infusions et conversations qui savent trop de choses",
    image: publicAsset("assets/img/rotas/streets/salon-the-vertical.png"),
    video: publicAsset("assets/video/rotas/salon-the-loop.mp4"),
    description: "Un passage en demi-ombre glisse vers la terrasse. Les tasses fument doucement, les plantes penchent l’oreille, et quelqu’un a laissé une chaise tournée vers la mer.",
    mood: "vapeur de thé, fleurs mauves, ombre fraîche, murmures minuscules",
    objective: "Rencontrer un PNJ, recevoir une rumeur ou débloquer une direction de promenade.",
    actions: [
      { label: "S’asseoir en terrasse", disabled: true },
      { label: "Demander les infusions", disabled: true },
    ],
    clues: ["Table isolée", "Carte des infusions absurdes", "Vue vers la côte"],
  },
  prohibited: {
    id: "prohibited",
    zone: "Centre de Rotas",
    title: "Rue Pro.Hibited",
    subtitle: "Boutique de Natasha · cartes, objets, avatars",
    image: publicAsset("assets/img/rotas/streets/prohibited-vertical.png"),
    video: publicAsset("assets/video/rotas/prohibited-loop.mp4"),
    description: "La vitrine de Natasha accroche la lumière comme un mensonge très bien habillé. On y devine des cartes, des masques, des avatars et des souvenirs qui n’ont pas décidé s’ils étaient légaux.",
    mood: "rideaux turquoise, vitrines fumées, parfum de boutique interdite, rire bleu",
    objective: "Brancher Pro.Hibited, les cartes et l’accès futur vers le loft de Natasha.",
    actions: [
      { label: "Ouvrir Pro.Hibited", href: "https://benoitlub.github.io/prohibited-online/", variant: "primary" },
      { label: "Voir les cartes", disabled: true },
      { label: "Chercher Natasha", disabled: true },
    ],
    clues: ["Masque dans la vitrine", "Paquet de cartes", "Escalier discret vers le loft"],
  },
  market: {
    id: "market",
    zone: "Centre de Rotas",
    title: "Place du Marché",
    subtitle: "Échoppes, rumeurs et fontaine centrale",
    image: publicAsset("assets/img/rotas/streets/marche-fontaine-vertical.png"),
    video: publicAsset("assets/video/rotas/marche-fontaine-loop.mp4"),
    description: "Les étals entourent la fontaine comme une petite assemblée bruyante. On y vend des fruits bleus, des cartes fausses, des directions vraies et des histoires à moitié remboursables.",
    mood: "tissus rayés, paniers, eau claire, voix superposées, odeur de sel",
    objective: "Installer les annonces du jour et les mini-quêtes de collecte.",
    actions: [
      { label: "Lire les annonces", disabled: true },
      { label: "Parler à un vendeur", disabled: true },
    ],
    clues: ["Affiche du jour", "Stand aux fruits bleus", "Passage vers les échoppes"],
  },
  stalls: {
    id: "stalls",
    zone: "Centre de Rotas",
    title: "Ruelle des Échoppes",
    subtitle: "Passages secondaires et raccourcis",
    image: publicAsset("assets/img/rotas/streets/echoppes-vertical.png"),
    video: publicAsset("assets/video/rotas/echoppes-loop.mp4"),
    description: "La ruelle se resserre entre les auvents. Les lanternes éclairent des portes basses, des vitrines minuscules et des raccourcis qui n’existent pas toujours deux fois de suite.",
    mood: "bois chaud, lanternes basses, pierres claires, secrets dans les angles",
    objective: "Préparer des objets à examiner, des portes fermées et des indices SATOR.",
    actions: [
      { label: "Examiner les vitrines", disabled: true },
      { label: "Suivre le raccourci", disabled: true },
    ],
    clues: ["Porte fermée", "Lanternes basses", "Marque SATOR possible"],
  },
  coast: {
    id: "coast",
    zone: "Centre de Rotas",
    title: "Escaliers vers la Côte",
    subtitle: "Sortie vers le port et la mangrove",
    image: publicAsset("assets/img/rotas/streets/acces-cote-vertical.png"),
    video: publicAsset("assets/video/rotas/acces-cote-loop.mp4"),
    description: "Les escaliers descendent vers l’air salé. Plus bas, la ville lâche prise et laisse entendre le port, les mouettes et les promesses de départ.",
    mood: "embruns, rambardes turquoise, soleil sur l’eau, bois humide",
    objective: "Préparer la transition vers Port Porsa Rotas puis la route côtière.",
    actions: [
      { label: "Descendre vers le port", disabled: true },
      { label: "Regarder la mer", disabled: true },
    ],
    clues: ["Ponton", "Mouettes", "Route vers la mangrove"],
  },
  fountain: {
    id: "fountain",
    zone: "Centre de Rotas",
    title: "Fontaine centrale",
    subtitle: "Point de spawn · carrefour de la place",
    image: publicAsset("assets/img/rotas/streets/fontaine-vertical.png"),
    video: publicAsset("assets/video/rotas/fontaine-loop.mp4"),
    description: "L’eau tourne au centre de la place. Les rues partent d’ici comme des idées hésitantes, et les mosaïques semblent garder en mémoire les pas de chaque visiteur.",
    mood: "eau claire, mosaïques spirales, lampes chaudes, rumeurs de marché",
    objective: "Servir de retour central et de choix de direction.",
    actions: [
      { label: "Choisir une direction", disabled: true },
      { label: "Écouter la fontaine", disabled: true },
    ],
    clues: ["Point de retour", "Choix de directions", "Journal de lieu"],
  },
};
