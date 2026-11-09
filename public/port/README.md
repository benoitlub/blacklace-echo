# Ressources pour l'arrivée au port

La scène `public/port/index.html` attend les trois fichiers suivants dans `public/port/assets/` :

- `port-jour.webp` — panorama diurne fourni par l'auteur
- `port-nuit.webp` — panorama nocturne fourni par l'auteur, même géographie
- `marie-jeanne.webp` — portrait extrait du concept validé, à remplacer si un portrait définitif est retenu

Les fichiers optimisés ont été préparés dans la conversation ChatGPT sous forme d'archive ZIP à décompresser puis à importer **individuellement** dans ce dossier via GitHub > Add file > Upload files.

Ne pas mettre le ZIP tel quel dans le dossier : GitHub Pages ne le décompresse pas.

## État technique
- Implémenté : scène autonome /port/, décor plein écran, bascule jour/nuit, perspective souris/tactile, titre en volume CSS avec traversée, apparition du dialogue Marie Jeanne, lien Feuch Institute et HoloMap, bouton passer, reduced-motion.
- Non réalisé : vraie géométrie extrudée Three.js, panorama 2,5D multi-calques, suivi de tête, PNJ Sherlock animés, audio spatialisé.
- **Ne pas présenter le titre CSS comme un maillage Three.js.**
- Test manuel mobile et desktop requis après import des ressources.

Le changement sur l'accueil redirige « Traverser la brume » vers `/port/`. Vérifier le comportement du bouton et les liens du mode exploration.
