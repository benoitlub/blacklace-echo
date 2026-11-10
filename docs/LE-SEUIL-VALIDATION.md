# Le Seuil — livraison du 10 novembre 2026

## État du dépôt

La PR #11 était déjà fusionnée le 9 novembre à 21:59 UTC, avant cette intervention.
Les améliorations suivantes sont livrées sur la branche demandée
`feat/marie-jeanne-arrival-dialogue`, après intégration de `main` à `95bfe5e`.
Une PR fusionnée ne peut pas recevoir de nouveaux commits dans son diff : aucun
nouveau changement n'est automatiquement fusionné ou déployé, aucune nouvelle
PR n'est créée. Le descriptif de #11 indique cette situation.

## Vérifications

- `npm test` : 41 tests passent, 12 fichiers.
- `npx tsc --noEmit -p tsconfig.app.json` : passe.
- `npm run build` : passe ; entrée Vite multipage et ressources locales.
- Lint ciblé sur les nouveaux scripts/modules : passe.
- Lint global : 8 erreurs préexistantes dans Map, Aloisia, composants UI et
  tailwind.config.ts (fichiers non modifiés par l'implémentation).
- `scripts/seuil-smoke.mjs` : parcours Chromium sur build de production,
  1440×900, 393×851, 851×393 et mouvement réduit 375×667 ; titre WebGL chargé,
  traversée, révélation, trois répliques, boutons dans l'écran, jour/nuit,
  passage rapide, ouverture Rotas et Feuch Institute, aucune erreur JS.
- `scripts/seuil-edge-smoke.mjs` : passage pendant la traversée sans reprise
  différée, son marche/arrêt, portail plein écran avec retour, activation
  dynamique de reduced-motion, absence de WebGL.
- Flux public de production : réponse HTTP réussie, 20 entrées et 6 dialogues
  lors de la vérification ; aucune écriture dans Sherlock.

Les captures de validation sont générées dans `artifacts/` (non versionné).
Lancer `npm run build`, puis `npm run preview -- --host 0.0.0.0 --port 4173`, puis
`SEUIL_URL=http://127.0.0.1:4173/blacklace-echo/port/ node scripts/seuil-smoke.mjs`.
Utiliser `CHROMIUM_PATH` si nécessaire, sinon Chromium Playwright installé.

## Limites explicites

Les formats mobiles ont été testés dans Chromium avec émulation tactile ;
aucun téléphone Android ou iPhone physique n'était connecté. WebKit téléchargé,
mais son lancement échoue faute de libgtk-4, libgraphene, libharfbuzz-icu,
libmanette, libhyphen et libGLESv2. L'environnement ne fournit ni sudo ni
installateur système : Safari/iOS reste à valider sur appareil.

Les deux panoramas et le portrait sont disponibles : aucune ressource requise
ne manque. La profondeur du paysage reste une approximation par plans masqués,
et l'eau un effet de lumière animé, sans reconstruction géométrique du décor.
Les habitants du panorama sont des étiquettes de présence vérifiée ; leurs
représentations et déplacements existants restent dans Rotas et HoloMap.
La police et Three.js sont locaux ; aucun CDN requis pour l'entrée.
