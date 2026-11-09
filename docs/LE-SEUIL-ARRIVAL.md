# Le Seuil — arrivée immersive à Porsa Rotas

## Objectif
À l'ouverture de Blacklace Island, le visiteur voit le quai à travers une fenêtre de profondeur. Il avance légèrement sur le quai et **traverse physiquement** les lettres 3D « BLACKLACE ISLAND ». Ce n'est qu'après ce seuil que les lieux et les PNJ deviennent visibles/identifiables et que Marie Jeanne accueille le visiteur dans un bandeau translucide.

## Sources visuelles
Les deux panoramas du quai, jour et nuit, fournis par l'auteur dans la conversation (même cadrage et même géographie). Les importer comme ressources optimisées, **sans les remplacer par une image générée différente**. Le portrait de Marie Jeanne de la maquette reste une proposition visuelle, à valider comme asset séparé. Ne pas embarquer la maquette entière comme image d'interface.

## Parcours
1. `quay` : panorama du quai sans panneaux de lieux ni PNJ superposés; ambiance mer/brume.
2. `title-crossing` : titre extrudé en 3D avec Three.js (ou technologie 3D déjà installée). Courte translation caméra sur l'axe du quai; les lettres passent sur les côtés et derrière la caméra. Pas de simple zoom CSS.
3. `reveal` : profondeur du port, brume qui s'allège, apparition progressive des lieux et présences déjà disponibles. Ne pas fabriquer de nouveaux événements Sherlock.
4. `welcome` : bandeau verre fumé en bas de l'écran, portrait indépendant, nom MARIE JEANNE, texte depuis `MARIE_JEANNE_WELCOME` dans `src/sherlock/arrival.ts`; avancer/réduire/fermer au clavier et au tactile.
5. `explore` : rendre HoloMap et accès existants disponibles; préserver la navigation vers Rotas et Feuch Institute.

## Mobile / accessibilité
- Bouton explicite « Entrer sur l'île », geste tactile non obligatoire, sans défilement involontaire.
- Bandeau compact mobile, largeur fluide, safe-area, portrait et boutons non superposés.
- Option « Passer l'introduction », clavier et lecteurs d'écran.
- `prefers-reduced-motion` : passage direct au panorama et au dialogue sans mouvement 3D.
- Gyroscope et webcam **facultatifs**, jamais nécessaires à l'entrée, permission uniquement après geste explicite.
- Jour/nuit en conservant exactement les mêmes coordonnées de hotspots.
- Sons facultatifs et muets par défaut; pas d'autoplay audio.
- Préchargement prudent, images WebP/AVIF, dégradation 2D sur appareil modeste.

## Réalisation et validation
Inspecter les routes et composants actuels avant toute modification. Réutiliser l'arrivée et les mécanismes de Rotas, les lieux et le flux Sherlock existants. Implémenter une véritable interface, pas une capture statique. Vérifier build et tests existants, puis tester les séquences en navigateur desktop et mobile (portrait/paysage), skip, retour, navigation, reduced-motion et absence de webcam. Ne pas fusionner ni déployer si les tests échouent.

## Hors périmètre initial
Pas de PNJ conversationnel inventé, pas de nouvelle économie, pas de serveur permanent, pas de reconstruction 3D intégrale de l'île.
