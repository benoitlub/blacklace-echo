# Rotas — tranche verticale 01 (brief de réalisation)

Statut : proposition de production fondée sur les références visuelles fournies par Benoît ; **aucun écran ou déplacement n'est déclaré implémenté**. Point de départ confirmé : port de Porsa Rotas, avec Marie Jeanne (voir `arrival.ts`). La liaison physique port → Rotas demeure à valider ; l'enchaînement ci-dessous est un parcours UX proposé, pas une route canonique.

## Séquence à réaliser

1. **Port / Marie Jeanne** : accueil et commande explicite « Explorer l'île ». Dialogue, voix et quêtes à écrire/valider ; ne pas les inventer dans les données canoniques.
2. **HoloMap** : focus sur Rotas ; afficher les autres destinations selon leur statut vérifié. Ne jamais révéler les secrets du yacht, de la grotte d'Aloisia ou de SATOR dans les données publiques.
3. **Transition** : zoom vers la place, motifs spiralés, vent marin / marché si ressources sonores autorisées. Respecter `prefers-reduced-motion`, fournir muet et saut de transition.
4. **Place de Rotas** : décor isométrique avec cinq zones interactives et fontaine repère ; retour carte et retour port accessibles.

## Composition visuelle de référence

- Fond : Maison de l'Œil, dôme principal, motif de l'œil au-dessus de l'entrée.
- Gauche : salon de thé, dôme turquoise et enseigne TEA.
- Droite : boutique, dôme turquoise et enseigne BOUTIQUE.
- Avant-plan : deux échoppes sous auvents turquoise/ocre.
- Centre : fontaine, mosaïques de spirales turquoise dans les pavés organiques.
- Architecture : pierre claire, tuiles turquoise patinées, bois peint, cuivre vieilli, vitraux, végétation grimpante, lanternes laiton.
- Deux registres : place diurne chaleureuse = monde vécu ; habillage holographique sombre = carte/observation. Les images sont des références, non des assets de production déjà intégrés.

## Points d'intérêt et identifiants locaux proposés

| ID local | Libellé | Interaction MVP | État |
| --- | --- | --- | --- |
| rotas-eye-house | Maison de l'Œil | ouvrir fiche/écran dédié | à produire |
| rotas-tea | Salon de thé | ouvrir fiche/écran dédié | à produire |
| rotas-boutique | Boutique | ouvrir fiche/écran dédié | à produire |
| rotas-market-1 | Échoppe du marché 1 | ouvrir fiche/écran dédié | à produire |
| rotas-market-2 | Échoppe du marché 2 | ouvrir fiche/écran dédié | à produire |
| rotas-fountain | Fontaine | point d'observation, non destination séparée | à produire |

Ces identifiants sont des hotspots d'une scène locale, pas de nouveaux nœuds du graphe Sherlock `PlaceId`. Aucun produit, inventaire, prix, quête ou droit d'accès n'est supposé.

## Contrat d'interface proposé

`sceneId: "rotas-square"` ; `hotspots: {id, label, bounds, action, accessibleLabel}[]` ; `transition: {from, to, reducedMotionFallback}` ; `returnTarget: "island-map"`. Les `bounds` sont à relever sur l'asset effectivement choisi et à recalculer selon le redimensionnement ; ne pas copier des coordonnées de concept art comme coordonnées géographiques. Les hotspots doivent fonctionner au clavier et au tactile, avec focus visible et alternative textuelle.

## Critères d'acceptation

- Le démarrage est au port avec Marie Jeanne, jamais directement sur la place.
- La carte mène à une transition évitable, puis à la place ; l'utilisateur peut revenir sans se bloquer.
- Les cinq hotspots sont distincts, nommés et utilisables au clavier/tactile ; la fontaine est observable.
- Le décor reste lisible sur mobile, sans boutons superposés aux libellés.
- Mode muet et réduction des animations respectés ; aucune piste audio ne démarre sans geste utilisateur.
- Aucun lieu secret ni donnée de paiement/NFT n'est exposé par défaut.
- Les scènes Unity et les médias de production sont indiqués « non audités » tant que leur présence n'est pas vérifiée.

## Découpage de réalisation

A. Inventorier les fichiers images effectivement disponibles dans le dépôt et leurs droits d'usage ; sélectionner un décor et une HoloMap. B. Construire la scène React responsive avec hotspots et fallback textuel. C. Brancher l'état d'arrivée sans toucher au graphe S-001. D. Ajouter transition, son optionnel, tests clavier/mobile. E. Préparer ensuite l'équivalent Unity dans metaverse-creator, sans prétendre qu'un pont live existe déjà.
