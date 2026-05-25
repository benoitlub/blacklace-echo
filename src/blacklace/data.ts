export type ZoneKey = "port" | "max" | "sator" | "ludmila" | "institute" | "network";

export const zones: Record<ZoneKey, { kicker: string; title: string; text: string; fragment: string }> = {
  port: {
    kicker: "Accès // Porsa Rotas",
    title: "Le Port",
    text: "Le port est la première frontière. Les visiteurs arrivent entre brume salée, terminaux perdus et signaux faibles.",
    fragment: "Chaque arrivée modifie légèrement l'île.",
  },
  max: {
    kicker: "Bar & lumières",
    title: "Max Liberty",
    text: "Le bar garde les conversations, les verres et les signaux faibles. Max sait souvent avant les autres.",
    fragment: "Les lumières ne s'éteignent jamais complètement.",
  },
  sator: {
    kicker: "Clairière // SATOR",
    title: "Clairière SATOR",
    text: "La clairière capte des fragments sans origine stable. Marty y parle aux signes, aux glitchs et aux choses qui répondent avant qu'on les appelle.",
    fragment: "SATOR AREPO TENET OPERA ROTAS.",
  },
  ludmila: {
    kicker: "Club // perception",
    title: "Club Ludmila",
    text: "Le club transforme les perceptions et brouille les temporalités. Ici, une danse peut devenir une archive.",
    fragment: "La basse ouvre parfois des portes.",
  },
  institute: {
    kicker: "Prototype // Feuch",
    title: "Feuch Institute",
    text: "Le Feuch Institute centralise les inventions, les jeux, les prototypes et les idées trop ambitieuses pour rester dans un carnet.",
    fragment: "Une idée abandonnée peut devenir une zone entière.",
  },
  network: {
    kicker: "Signal // Broadcast",
    title: "Pro.Hibited Network",
    text: "BNN24, Moscomiul Break et transmissions fragmentaires. Le réseau parle avant que l'île ne s'explique.",
    fragment: "Les signaux faibles sont souvent les plus vrais.",
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

export const videoSources = [
  "/assets/videos/natasha-live.mp4",
  "/assets/videos/nat2.mp4",
  "/assets/videos/nat3.mp4",
  "/assets/videos/nat4.mp4",
  "/assets/videos/nat5.mp4",
  "/assets/videos/nat6.mp4",
  "/assets/videos/nat7.mp4",
];
