export const NATASHA_GREETING = "Salut, moi c’est Natasha. Tu veux parler de Rotas, de mes streams ou des glitches ?";

export function replyAsNatasha(message: string): string {
  const text = message.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
  if (/\b(glitch\w*|anomalie\w*|souvenir\w*|temporel\w*)\b/.test(text)) {
    return "Je m’intéresse aux anomalies temporelles et aux souvenirs qui refont surface. Si tu as remarqué quelque chose d’étrange, essaie de te rappeler le lieu et l’heure.";
  }
  if (/\b(stream\w*|podcast\w*|diffus\w*)\b/.test(text)) {
    return "Je fais des streams de nuit depuis Rotas. J’y parle de l’île et j’y signale les glitches. Je fais aussi des podcasts.";
  }
  if (/\b(rotas|village|marche|salon|the|boutique\w*|ile)\b/.test(text)) {
    return "Tu es à Rotas. On est devant le salon de thé. Tu peux aussi faire un tour au marché ou passer voir les boutiques.";
  }
  if (/\b(bonjour|salut|coucou|bonsoir)\b/.test(text)) return NATASHA_GREETING;
  return "Je n’ai pas de réponse à ça dans cette démo. Demande-moi plutôt ce que je fais à Rotas, ce que je diffuse ou ce que j’appelle un glitch.";
}
