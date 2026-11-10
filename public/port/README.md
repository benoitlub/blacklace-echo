# Le Seuil — ressources et réalisation

L'entrée est désormais compilée par Vite depuis `port/index.html` et
`src/port/arrival.ts`. Ne pas recréer `public/port/index.html` : il écraserait
l'entrée compilée. L'URL publiée reste `/blacklace-echo/port/`.

Ressources vérifiées et conservées :
- `public/port/port-jour.webp` : panorama auteur 1536 × 864.
- `public/port/port-nuit.webp` : panorama auteur 1536 × 864, même géographie.
- `public/port/marie-jeanne.webp` : portrait indépendant avec transparence.
- `public/port/title-font.json` : Helvetiker Bold depuis Three.js ; licence
  MAGENTA incluse dans les métadonnées du fichier.

Le titre utilise TextGeometry et des matériaux de face/tranche. La caméra
traverse son plan, de z=20 à z=-4, en 6,7 s, puis la révélation dure 1,3 s.
Les images restent des plans 2,5D dérivés du même panorama, avec masques
progressifs ; ce ne sont pas des bâtiments reconstruits ou des calques détourés.
Le mode sans WebGL ou avec mouvement réduit ouvre directement le dialogue.

Les trois répliques viennent de `src/sherlock/arrival.ts`. Les lieux, le portail
plein écran, Rotas, les salles Feuch, HoloMap et les conversations vérifiées
existantes sont conservés. Les étiquettes de présence utilisent le flux public
Sherlock configuré par `VITE_SHERLOCK_PUBLIC_FEED_URL`, sans simulation locale.
Sans flux, aucune présence n'est inventée. Les déplacements détaillés restent
rendus dans Rotas et HoloMap par leurs composants existants.

Le son est une ambiance de mer synthétisée localement après un clic explicite,
muette par défaut. Aucun serveur ou abonnement ajouté. Webcam inutilisée ;
le capteur d'orientation existant reste facultatif et demande une permission
uniquement après un clic explicite.

Validation et limites : voir `docs/LE-SEUIL-VALIDATION.md`.
