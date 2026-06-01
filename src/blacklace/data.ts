export type ZoneKey = "port" | "max" | "sator" | "ludmila" | "institute" | "network";

export type ZoneAction = {
  label: string;
  href?: string;     // external link
  to?: string;       // internal route
  intent?: "primary" | "ghost" | "warn";
  hint?: string;
  signal?: string;   // chat line to push
  phase?: "phase-signal" | "phase-feuch" | "phase-reboot" | "phase-sator";
};

export type Zone = {
  kicker: string;
  title: string;
  text: string;
  fragment: string;
  mood?: string;
  actions?: ZoneAction[];
};

export const zones: Record<ZoneKey, Zone> = {
  port: {
    kicker: "Accès // Porsa Rotas",
    title: "Le Port",
    text: "Le port est la première frontière. Les visiteurs arrivent entre brume salée, terminaux perdus et signaux faibles.",
    fragment: "Chaque arrivée modifie légèrement l'île.",
    actions: [
      { label: "Traverser la brume", intent: "primary", signal: "Traversée de la brume engagée." },
      { label: "Écouter les signaux faibles", intent: "ghost", signal: "Captation des signaux faibles…" },
    ],
  },
  max: {
    kicker: "Bar & lumières",
    title: "Max Liberty",
    text: "Le bar garde les conversations, les verres et les signaux faibles. Max sait souvent avant les autres.",
    fragment: "Les lumières ne s'éteignent jamais complètement.",
    actions: [
      { label: "S'accouder au comptoir", intent: "primary", signal: "Max te sert quelque chose de fort." },
      { label: "Demander une rumeur", intent: "ghost", signal: "Max murmure une rumeur de la nuit." },
    ],
  },
  sator: {
    kicker: "Clairière // SATOR",
    title: "Clairière SATOR",
    text: "La clairière capte des fragments sans origine stable. Marty y parle aux signes, aux glitchs et aux choses qui répondent avant qu'on les appelle.",
    fragment: "SATOR AREPO TENET OPERA ROTAS.",
    mood: "sator",
    actions: [
      { label: "Activer mode SATOR", intent: "primary", phase: "phase-sator", signal: "Mode SATOR engagé. La géométrie répond." },
      { label: "Lire le carré", intent: "ghost", signal: "SATOR / AREPO / TENET / OPERA / ROTAS." },
      { label: "Appeler Marty", intent: "ghost", signal: "Marty arrive sans bruit." },
    ],
  },
  ludmila: {
    kicker: "Club // perception",
    title: "Club Ludmila",
    text: "Le club transforme les perceptions et brouille les temporalités. Ici, une danse peut devenir une archive.",
    fragment: "La basse ouvre parfois des portes.",
    actions: [
      { label: "Entrer dans le club", intent: "primary", signal: "Tu pousses la porte. La basse t'avale." },
      { label: "Perception altérée", intent: "ghost", phase: "phase-sator", signal: "Perception altérée : les contours respirent." },
      { label: "Voir les fragments", intent: "ghost", signal: "Fragments du club projetés sur les murs." },
    ],
  },
  institute: {
    kicker: "Prototype // Feuch",
    title: "Feuch Institute",
    text: "Le Feuch Institute centralise les inventions, les jeux, les prototypes et les idées trop ambitieuses pour rester dans un carnet.",
    fragment: "Une idée abandonnée peut devenir une zone entière.",
    mood: "feuch",
    actions: [
      { label: "Blacklace Dice ↗", href: "https://benoitlub.github.io/blacklace-dice/", intent: "primary", hint: "Le dé choisit la mission. Tu exécutes." },
      { label: "Fée Belette Reboot ↗", href: "#", intent: "ghost", hint: "Module de reset — accès instable.", phase: "phase-reboot" },
      { label: "Pro.Hibited Network", intent: "ghost", hint: "Réseau de signaux & transmissions." },
    ],
  },
  network: {
    kicker: "Signal // Broadcast",
    title: "Pro.Hibited Network",
    text: "BNN24, Moscomiul Break et transmissions fragmentaires. Le réseau parle avant que l'île ne s'explique.",
    fragment: "Les signaux faibles sont souvent les plus vrais.",
    actions: [
      { label: "Moscomiul Break ↗", href: "https://www.youtube.com/watch?v=6gu4GrZlt1g", intent: "primary" },
      { label: "GitHub ↗", href: "https://github.com/benoitlub", intent: "ghost" },
      { label: "Blacklace Dice ↗", href: "https://benoitlub.github.io/blacklace-dice/", intent: "ghost" },
      { label: "Archive transmissions", intent: "ghost", signal: "Archive ouverte : transmissions fragmentaires." },
    ],
  },
};

export const scriptedLines: [string, string][] = [
  ["SYSTEM", "Micro-anomalie détectée près de Rotas."],
  ["MAX", "Les lumières restent allumées. Pas de panique au comptoir."],
  ["ALOISIA", "Je garde ce fragment dans la brume."],
  ["MARTY", "Je confirme : la route du port a encore bégayé."],
  ["NATASHA", "Le signal vidéo saute, mais il revient toujours différent."],
  ["SLOBODANE", "Je ne dis pas que c'est cosmique. Je dis que ça regarde dans notre direction."],
];

export type VideoSource =
  | { type: "local"; label: string; src: string }
  | { type: "youtube"; label: string; id: string };

const localVideo = (label: string, file: string): VideoSource => ({
  type: "local",
  label,
  src: `${import.meta.env.BASE_URL}assets/videos/${file}`,
});

export const videoSources: VideoSource[] = [
  localVideo("ROTAS // SIGNAL PRINCIPAL", "natasha-live.mp4"),
  localVideo("MARTY // SIGNAL LOCAL", "marty.mov"),
  localVideo("FEUCH // SIGNAL LOCAL", "feuch.mov"),
  localVideo("NATASHA // FRAGMENT 02", "nat2.mp4"),
  localVideo("NATASHA // FRAGMENT 03", "nat3.mp4"),
  localVideo("NATASHA // FRAGMENT 04", "nat4.mp4"),
  localVideo("NATASHA // FRAGMENT 05", "nat5.mp4"),
  localVideo("NATASHA // FRAGMENT 06", "nat6.mp4"),
  localVideo("NATASHA // FRAGMENT 07", "nat7.mp4"),
  { type: "youtube", label: "MOSCOMIUL BREAK // YOUTUBE", id: "6gu4GrZlt1g" },
];

export const youtubeSignals = [
  {
    type: "moscomiul",
    label: "MOSCOMIUL BREAK",
    phase: "phase-signal",
    id: "6gu4GrZlt1g",
  },
];
