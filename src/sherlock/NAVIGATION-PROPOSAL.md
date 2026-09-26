# Blacklace Island — circulation proposée, non activée

Ce document est un **plan de validation**, pas une carte canonique. Les quatre équivalences de noms ont été confirmées par Benoît. Les relations parent/sous-zone (Fournaise/cratère, Club Ludmila/yacht) ne sont pas des accès praticables. Les coordonnées des neuf hotspots de `Map.tsx` sont des positions d'affichage, non des preuves d'adjacence.

**Entrée canonique confirmée :** le visiteur commence au port de Porsa Rotas, avec Marie Jeanne. Cette donnée est définie dans [arrival.ts](./arrival.ts). Le village de Rotas n'est pas le point de départ. La suite du parcours, les dialogues et les quêtes restent à définir.\n\nLes sept liens ci-dessous sont consignés dans [route-candidates.ts](./route-candidates.ts), avec leur provenance et une question de validation. `CONFIRMED_ROUTES` reste vide ; aucune transition n'est activée.

| Lieux proposés | Indice | Validation nécessaire |
| --- | --- | --- |
| Rotas ↔ port | `islandPoiScenes.ts` évoque des escaliers vers le port, action désactivée | Le départ est au port ; confirmer le chemin et le sens de circulation vers Rotas. |
| Port ↔ digue / route côtière | `islandPoiScenes.ts` prévoit cette transition | Point de départ ? |
| Digue ↔ mangrove | Texte de la micro-scène « accès côte » | Accès direct ? |
| Loft Natasha ↔ studio Natasha | Description de Benoît | Pièce intérieure ou bâtiment séparé ? |
| Cascade ↔ prairie Fée Belette | Description de Benoît | Attenantes ? |
| Fournaise ↔ cratère / scène rave | Sous-zone confirmée | Accès et conditions ? |
| Club Ludmila ↔ yacht secret | Association confirmée | Accès et visibilité ? |

**Confidentialité :** le yacht est un lieu connu du registre interne, mais son accès, ses coordonnées et les éventuelles conditions de découverte ne doivent pas être publiés par défaut. Il en va de même de la grotte sous-marine d'Aloisia et des secrets SATOR.

**Prochaine étape technique après validation :** représenter les routes approuvées dans un graphe de navigation distinct du world-core S-001, définir les conditions d'accès, puis seulement brancher les interactions de la carte et le pipeline Unity. Ne pas transformer automatiquement un lien proposé en chemin actif.
