# Blacklace Island — registre des lieux v0.2 (identités confirmées, pas carte géographique)

Source de l'inventaire : liste fournie par Benoît le 26 septembre 2026. Les liens Notion ci-dessous servent de provenance documentaire, pas de preuve d'une scène Unity existante. Aucun emplacement, accès, asset ou statut interactif n'est déduit d'une illustration ou d'un texte.

## Sources vérifiées

- [Lieux](https://app.notion.com/p/35b3911972538024b088ed542ead7418) : route côtière, Fournaise, cœur d'Aloisia, Porsa Rotas, Rotas, jardins, laboratoires, Institute, loft, atelier Ten-Net, Max Liberty et autres lieux.
- [Bible visuelle et écrans visitables](https://app.notion.com/p/373391197253818c8bf0e1620b63f45c) : carte/hub, Rotas, Institute, Max Liberty, Natasha Live, archives SATOR, Moscomiul Break. Une description d'écran n'est pas une scène 3D.
- [Feuch Lab — portail](https://app.notion.com/p/3e5391197253817a91e0c078d0e8257a) : portail web existant, soutien Ko-fi ; ne pas confondre le portail, le laboratoire de Nikolas et l'Institute in-world.
- [Moscomiul Break — studio de Marty](https://app.notion.com/p/36239119725381aaab9ddb8b1fd12d2d) : fiche repérée, contenu à approfondir.
- [Fragments d'Aloisia](https://app.notion.com/p/35b391197253804c8ccef994e7bcb385) : grotte sous-marine et cœur de l'île.

## Identités confirmées par Benoît (26 septembre 2026)

- Bar de la plage = Max Liberty.
- Digue et peintures de Marty = route côtière.
- Dolmens SATOR = clairière SATOR.
- Cascade de la Fée Belette = Cascade Reboot.

Ces équivalences sont enregistrées dans [location-identities.ts](./location-identities.ts). Elles ne prouvent ni proximité physique ni chemin praticable. Le graphe des routes confirmées reste vide ; le graphe S-001 reste inchangé.

## Inventaire à vérifier

Statuts : **lore** = mention documentaire vérifiée ou apport explicite de Benoît ; **3D** = non auditée ; **interaction** = non auditée. « Non auditée » ne signifie pas « absente ». Les sous-zones ne sont pas des destinations distinctes par défaut.

| ID proposé | Lieu / sous-zone | Personnage ou fonction | Provenance | Lore | 3D | Interaction |
| --- | --- | --- | --- | --- | --- | --- |
| beach-bar | Bar de la plage = Max Liberty | Max, accueil | Benoît ; Lieux ; Bible | oui | non auditée | non auditée |
| seawall | Digue et peintures de Marty = route côtière | Marty, art et indices | Benoît ; Lieux | oui | non auditée | non auditée |
| institute | Feuch Institute | projets, archives, soutien | Benoît ; Lieux ; Bible ; Feuch Lab | oui | non auditée | non auditée |
| nikolas-lab | Feuch Lab / laboratoire de Nikolas | créations de Nikolas | Benoît ; Lieux (laboratoires) | oui | non auditée | non auditée |
| natasha-loft | Loft de Natasha | Natasha | Benoît ; Lieux | oui | non auditée | non auditée |
| natasha-studio | Studio podcast / YouTube de Natasha | Natasha Live | Benoît ; Bible | oui | non auditée | non auditée |
| slobodane-garden | Jardin de Slobodane | Slobodane | Benoît ; Lieux (jardins) | oui | non auditée | non auditée |
| feuch-cave | Grotte du Feuch | Feuch | Benoît | oui | non auditée | non auditée |
| belette-waterfall | Cascade de la Fée Belette = Cascade Reboot | Fée Belette | Benoît | oui | non auditée | non auditée |
| belette-meadow | Prairie de la Fée Belette | Fée Belette | Benoît | oui | non auditée | non auditée |
| fournaise | Fournaise de Feuch | Feuch, rave | Benoît ; Lieux | oui | non auditée | non auditée |
| fournaise-crater | Cratère / scène de rave | sous-zone Fournaise | Benoît ; Lieux | oui | non auditée | non auditée |
| ludmila-club | Club de Ludmila | Ludmila, expériences perceptives | Benoît ; Lieux | oui | non auditée | non auditée |
| ludmila-secret | Yacht secret du Club de Ludmila | Ludmila | Benoît | oui (correction confirmée) | non auditée | non auditée |
| hanging-forest | Forêt suspendue | exploration | Benoît | oui | non auditée | non auditée |
| mangrove | Mangrove | exploration | Benoît | oui | non auditée | non auditée |
| lolo-lab | Laboratoire de Lolo | Lolo | Benoît | oui | non auditée | non auditée |
| marty-studio | Studio Moscomiul Break | Marty, tournages | Benoît ; Bible ; fiche studio | oui | non auditée | non auditée |
| sator-dolmens | Dolmens SATOR = clairière SATOR | mystère, archives | Benoît ; Bible | oui | non auditée | non auditée |
| aloisia-cave | Grotte sous-marine / cœur d'Aloisia | Aloisia, mémoire | Benoît ; Lieux ; Fragments | oui | non auditée | non auditée |
| ten-net-tattoo | Salon de tatouage de Ten-Net (10net) | Ten-Net | Benoît ; Lieux | oui | non auditée | non auditée |

### Lieux documentés à ne pas perdre, hors liste ci-dessus

Port de Porsa Rotas, village de Rotas, boutique Pro.Hibited, disquaire, auberge AREPO, observatoire de la Fournaise et système de reboot. Ils nécessitent la même vérification avant consolidation du registre.

## Contrat de données proposé (non implémenté)

`id`, `displayName`, `aliases`, `parentId?`, `characterIds`, `sourceUrls`, `loreStatus`, `sceneStatus`, `interactionStatus`, `unitySceneRef?`, `assetRefs[]`, `worldCorePlaceId?`, `reviewNotes[]`.

Ne pas injecter les 21 entrées dans `PlaceId` par simple extension : le graphe S-001 ne possède que neuf nœuds de simulation abstraits. Les quatre équivalences ci-dessus sont validées ; valider séparément les chemins. Ne pas rendre publics les secrets narratifs via le bundle client. Les statuts de paiement, d'accès premium et de NFT restent non vérifiés.

## Prochaine vérification technique

1. Auditer le dépôt `metaverse-creator` pour les scènes, assets et opérations Unity réellement implémentés.
2. Auditer `blacklace-echo` et `feuchlab` pour les écrans et liens effectivement utilisables.
3. Compléter les colonnes 3D / interaction avec références de fichiers ou preuves d'exécution ; conserver « non auditée » sinon.
4. Faire confirmer les voisinages et chemins avant d'alimenter le graphe géographique, sans modifier le moteur S-001.
