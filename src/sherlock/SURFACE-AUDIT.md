# Blacklace — audit croisé des surfaces (26 septembre 2026)

Audit statique des fichiers GitHub consultés ; aucune application lancée, aucun déploiement, asset binaire ou projet Unity inspecté. Ce document complète [LOCATION-REGISTRY.md](./LOCATION-REGISTRY.md), sans changer la carte ni le canon.

## Blacklace Echo — preuves de code

- [src/pages/Map.tsx](https://github.com/benoitlub/blacklace-echo/blob/main/src/pages/Map.tsx) définit neuf hotspots : port, rotas, max, ludmila, sator, institute, fournaise, reboot, observatoire. Ce sont des positions en pourcentage sur une image `island-cutout.png` dans une scène CSS inclinée, **pas des coordonnées géographiques ou une scène Unity**.
- Seul le hotspot `rotas` ouvre un composant de zone (`RotasPlaza`) après transition. Les autres ouvrent un panneau d'information (nom/statut/fermer), pas un intérieur visitable.
- La météo et l'heure tournent par intervalles côté navigateur ; elles ne prouvent pas une météo persistante synchronisée avec Sherlock.
- [src/data/islandPoiScenes.ts](https://github.com/benoitlub/blacklace-echo/blob/main/src/data/islandPoiScenes.ts) décrit sept micro-scènes de Rotas : Maison de l'Œil, salon de thé, rue Pro.Hibited, marché, échoppes, accès côte, fontaine. Images/vidéos sont référencées, **existence des fichiers et rendu non vérifiés**. La majorité des actions sont `disabled: true` ; seule la rue Pro.Hibited propose un lien externe actif dans ces données.
- [src/blacklace/data.ts](https://github.com/benoitlub/blacklace-echo/blob/main/src/blacklace/data.ts) expose les zones port, Max, SATOR, Ludmila, Institute et Network avec signaux textuels et liens vers des expériences externes. Les actions textuelles ne sont pas des interactions de simulation ou Unity.

## Metaverse Creator — preuves de code/documentation

- [README](https://github.com/benoitlub/metaverse-creator/blob/main/README.md) décrit `POST /generate`, `GET /jobs/:jobId`, `GET /jobs/:jobId/model.glb`, cockpit React et mode mock produisant un GLB minimal (triangle). Ce document est une preuve de contrat documenté, **pas une validation d'exécution dans cet audit**.
- Inspection Unity, synchronisation, opérations réversibles, publication et état persistant figurent explicitement parmi les capacités **prévues**. Aucun lieu du registre n'est donc marqué « 3D vérifiée » sur la seule foi de ce README.
- La couche reste volontairement agnostique de l'univers ; le registre Blacklace doit être fourni par un adaptateur/contexte, sans coder les noms de l'île dans le moteur générique.

## Feuch Lab — divergence documentaire à résoudre

- [Fiche Notion « Feuch Lab — Portail du Feuch Institute »](https://app.notion.com/p/3e5391197253817a91e0c078d0e8257a) décrit un portail vers jeux, projets, Bazar et Ko-fi.
- Le [README actuel du dépôt `feuchlab`](https://github.com/benoitlub/feuchlab/blob/main/README.md) décrit au contraire **Dr. Marty's Walk Protocol**, une PWA expérimentale utilisant des capteurs de téléphone.
- Ne pas affirmer que le dépôt actuel implémente le portail décrit par la fiche Notion. Vérifier historique, déploiement `feuchlab` et éventuel dépôt distinct avant de relier des boutons de soutien ou de migrer du contenu. Ne pas modifier les paiements.

## Matrice de correspondance minimale

| Registre | Echo aujourd'hui (code) | Metaverse Creator | À décider |
| --- | --- | --- | --- |
| port | hotspot + zone textuelle | aucune scène spécifique vérifiée | transition depuis Rotas |
| rotas | hotspot + `RotasPlaza` + 7 micro-scènes déclarées | cible documentaire de génération | granularité des rues et parcours |
| beach-bar / Max Liberty | hotspot + zone textuelle | cible documentaire | bar de plage = Max Liberty ? |
| ludmila-club | hotspot + zone textuelle | aucune scène vérifiée | « match secret » : formulation à préciser |
| sator-dolmens | hotspot « Clairière SATOR » + zone textuelle | aucune scène vérifiée | dolmens = sous-zone de la clairière ? |
| institute | hotspot + zone textuelle + liens externes | cible documentaire | séparer Institute / labo Nikolas / portail web |
| fournaise | hotspot + visuel volcan + statut « fermé » | aucune scène vérifiée | cratère/scène rave comme sous-zone |
| aloisia-cave | pas de hotspot dédié dans Map.tsx | aucune scène vérifiée | accès narratif à protéger |
| ten-net-tattoo | pas de hotspot dédié dans Map.tsx | aucune scène vérifiée | emplacement à confirmer |

Les autres lieux restent **non audités** : ne pas interpréter l'absence dans ces fichiers comme une absence dans tout le dépôt ou dans Unity.

## Décisions avant toute carte de circulation

1. Valider les équivalences `bar de la plage ↔ Max Liberty`, `digue ↔ route côtière`, `dolmens ↔ clairière SATOR`, `cascade Fée Belette ↔ Cascade Reboot` ; aucune n'est imposée ici.
2. Définir les liens géographiques dans un graphe distinct du graphe expérimental S-001 ; les coordonnées visuelles des hotspots ne prouvent pas l'adjacence.
3. Distinguer `documenté`, `interface déclarée`, `asset vérifié`, `interaction testée`, `scène Unity vérifiée`.
4. Vérifier le contenu du déploiement Feuch Lab avant de lui attribuer la fonction de portail commercial.
