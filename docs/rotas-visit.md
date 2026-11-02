# Promenade de Rotas

La visite est une scène illustrée navigable, pas un environnement 3D reconstruit.
Les six décors proviennent des images fournies par Benoît le 2 novembre 2026,
converties en WebP sans changer leur composition. L'illustration générale conserve
les dômes turquoise, la pierre dorée, les mosaïques et la fontaine. Les vues de rue
sont des étapes de promenade ; leurs liaisons ne modifient pas le graphe géographique
Sherlock, les identifiants PlaceId ou les positions canoniques de l'île.

## Commandes

- Glisser et pincer sur le décor ; boutons +/−, recentrage et flèches au clavier.
- Étapes toujours accessibles dans le bandeau inférieur, même si un point est hors champ.
- Points de passage vers les rues ; points d'observation avec détail compact.
- Retour HoloMap à tout moment ; Échap ferme le détail, revient à la place, puis à la carte.
- Éclairage du soir facultatif. Le son, une texture synthétique eau/vent générée dans
  le navigateur, est coupé au départ et n'est activé que par une commande explicite.

## Habitants et limites

Les habitants viennent des présences Sherlock déjà reçues par la carte. Leur activité,
intention et dernier événement sont consultables ; aucune conversation inventée ou
réponse d'IA n'est affichée. Les marqueurs sont répartis pour la lisibilité : leurs
coordonnées locales ne prétendent pas représenter une position réelle dans la rue.
Les figurants peints dans les décors ne sont pas des présences Sherlock.
Les intérieurs, achats et dialogues interactifs ne sont pas implémentés par cette visite.

## Validation

Le contrôle navigateur couvre portrait mobile, bureau et paysage : chargement des six
images, navigation, zoom borné, déplacement clavier, retour sans réouverture tardive,
mode soir et panneau des habitants. Les captures sont conservées comme artefacts CI.
Les animations respectent prefers-reduced-motion ; l'arrière-plan est inert durant
la visite et le focus est contenu dans la fenêtre.
