# Sherlock × Octopus — audit de démarrage réel (26 septembre 2026)

## Constat vérifié dans le code

- `blacklace-echo/src/sherlock/world-core.ts` : `initialWorld`, `runCycle`, `applyEvent`, `replay` et `runControl` existent. `runCycle` **reçoit** des actions du demandeur ; il ne décide pas pour les personnages. `scriptedControlActions` est explicitement un groupe de contrôle scripté, pas une IA.
- `blacklace-echo/src/sherlock/persistence.ts` : adaptateur D1 `createSession`, `loadSession`, `appendCycle` ; ce fichier ne prouve ni base D1 provisionnée, ni migration appliquée, ni Worker déployé.
- `blacklace-echo/src/App.tsx` : routes publiques /, /map, /aloisia, /atlas ; aucune route de démarrage Sherlock. `Map.tsx` affiche la carte et Rotas mais n'appelle pas `runCycle` ni un endpoint Sherlock.
- `octopus-engine/src/autonomous-cycle.ts` : registre de jobs et exécuteur injecté ; les jobs sont en mémoire et perdus au redémarrage du serveur.
- `octopus-engine/src/event-store.ts` : journal universel append-only en mémoire ; ce n'est pas le journal persistant des sessions Sherlock.

## Ce qui empêche honnêtement « Démarrer la simulation »

1. Aucun service serveur Sherlock audité qui charge une session D1, demande une décision à Octopus, valide l'action, écrit le cycle atomiquement et renvoie l'état effectivement relu.
2. Aucun contrat de décision personnage (identité, état/mémoire, objectif, actions autorisées, provenance de décision, erreur/repli explicite).
3. Aucune preuve de liaison Octopus ↔ Sherlock ni d'autorisation et configuration d'un modèle pour les décisions.
4. Aucun endpoint de statut permettant au cockpit de distinguer indisponible, en cours, bloqué, terminé et persisté.
5. Le graphe S-001 comporte des connexions de simulation abstraites, pas des routes géographiques approuvées. Ne pas présenter leurs déplacements comme la circulation canonique de l'île.

## Contrat minimal du premier vrai cycle (à implémenter)

`POST /api/sherlock/sessions` : créer côté serveur une session avec Marie Jeanne au port ; retourner l'identifiant et l'état relu depuis D1.

`POST /api/sherlock/sessions/:id/cycles` : charger état courant ; solliciter une décision auprès d'un exécuteur Octopus **réel** ; valider l'acteur, les lieux, les droits et l'action ; écrire les événements par `appendCycle` ; relire D1 ; retourner état, événements et provenance (opération, moteur, horodatage). Sur échec d'Octopus ou de D1, retourner une erreur explicite et **ne pas produire de cycle simulé**.

`GET /api/sherlock/sessions/:id` : état et journal reconstruits depuis D1, jamais des nombres de démonstration.

Le bouton Démarrer doit être désactivé tant que le healthcheck serveur, la base D1 et l'exécuteur ne sont pas confirmés. Le bouton Pause doit stopper les nouveaux cycles, sans prétendre annuler un cycle déjà validé.

## Validation de bout en bout requise

Créer session → relire D1 → exécuter une décision Octopus → valider → persister cycle → recharger depuis une nouvelle requête → vérifier identité, état, événement et provenance. Tester également l'indisponibilité d'Octopus, un mouvement interdit, une requête concurrente et un redémarrage du serveur. Aucun mode scripté ne doit se substituer silencieusement à un échec.

**État actuel : audit statique partiel, pas de test d'exécution ni de déploiement vérifié.**
