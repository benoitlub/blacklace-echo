# Blacklace Island — lot de références visuelles, fiche de production v0.1

Ce document décrit les visuels transmis par Benoît dans la conversation. **Références visuelles seulement** : les fichiers image ne sont pas encore importés dans ce dépôt ; aucune scène Unity, texture PBR, interaction, boutique ou paiement n'est déclarée fonctionnelle par cette fiche.

## Inventaire du lot

| Repère | Visuel fourni | Usage cible proposé | Traitement requis |
| --- | --- | --- | --- |
| V01 | Affiche du cocktail MOSCOMIUL, bar Liberty, ingrédients affichés | Bar de la plage / Max Liberty ; élément de carte et décor | Conserver comme affiche de fiction ; valider recette et mentions de marques avant toute utilisation commerciale |
| V02 | Trois verres sur médaillon FEUCH INSTITUTE, œil et spirales dorés | Décalcomanie de comptoir, plateau ou motif au sol | Isoler le motif ; vérifier lisibilité à petite échelle |
| V03 | Plateau MOSCOMIUL / Blacklace, écran C/2025 N1 ATLAS, flacons lumineux | Studio de Marty / Moscomiul Break | Séparer mobilier, enseignes, écran et accessoires ; l'écran est une référence de décor, pas un flux live |
| V04 | T-shirt noir à créature cyclope orange | Produit dérivé / visuel de boutique | Obtenir artwork source séparé du mockup avant impression ; disponibilité commerciale non vérifiée |
| V05 | Carte gravée « BLACKLACE ISLAND » : Rotas, port, volcan, sanctuaire, Feuchroom, cœur d'Aloisia | Signalétique et inspiration cartographique | Ne pas convertir les positions dessinées en coordonnées ou routes canoniques |
| V06 | Œil triangulaire à effet CRT/RGB | Identité graphique, transition, scanner ou archive | Décliner en SVG/texture avec variantes nettes et bruitées |
| V07 | Atlas de textures sombres : spirales, fleur, disques, végétation, fissures | Sols, murs, inscriptions et interfaces de lieux | Découper les cellules ; créer des matériaux raccordables, cartes normal/roughness si besoin |
| V08 | Planche de nuages et fumées, du clair au sombre, avec variantes colorées | Ambiance et VFX selon les zones | Extraire les sprites ; choisir des effets peu coûteux pour mobile ; aucune météo dynamique présumée |
| V09 | Quatre motifs de pavage turquoise, sable et bois peint | Place de Rotas, chemins, éléments de décor | Tester répétition et échelle ; conserver les variantes non spiralées |
| V10 | Vue zénithale d'un chemin pavé turquoise avec spirales et végétation | Chemins de Rotas, référence de composition | Référence de layout, pas une texture directement tileable |

## Priorité de production : Place de Rotas

Les visuels antérieurs fournis par Benoît définissent un ensemble cohérent : Maison de l’Œil, salon de thé, boutique, deux échoppes de marché, fontaine centrale, pavés spiralés, tuiles turquoise patinées, pierre claire, bois peint, cuivre patiné, végétation grimpante et lanternes en laiton. Le rendu isométrique et les écrans de carte/transition sont des **cibles de direction artistique**, non une preuve de géométrie 3D disponible.

Ordre de réalisation proposé :
1. **Blocage spatial** : plateforme de la place, cinq volumes, fontaine, escaliers et accès côtier ; valider les proportions avant détails.
2. **Kit modulaire** : dômes, arches, portes, auvents, étals, garde-corps, lanternes et jardinières.
3. **Matériaux** : pierre, tuile, cuivre, bois, toile rayée, mosaïque et végétation ; déclinaisons LOD/mobile.
4. **Habillage** : pavage spiralé, enseignes, motifs de l'œil, signalétique et éclairage.
5. **Navigation** : hotspots Maison de l’Œil / thé / boutique / marché / fontaine, seulement après validation de leurs fonctions et des chemins.

## Règles de cohérence

- Ne pas confondre la **Maison de l’Œil de la place de Rotas** avec le **Feuch Institute** sans validation de Benoît.
- Le bar de la plage est identifié comme **Max Liberty** dans le registre des lieux ; le cocktail MOSCOMIUL est une référence d'ambiance, pas une preuve d'une carte commerciale active.
- Le studio Moscomiul Break est associé à **Marty** ; le visuel de plateau ne confirme ni une scène Unity ni une émission en direct.
- Les images de carte, d'interface et de signalétique peuvent contenir des libellés ou proportions illustratifs : vérifier orthographe, fonctions et géographie avant intégration.
- Préserver les images originales et produire des dérivés optimisés ; noter la provenance et les droits avant diffusion ou vente.

## Critères d'acceptation du prochain lot

- Un dossier d'assets source identifié et versionné (ou référencé) avec provenance, dimensions et droits.
- Une scène de blocage Rotas visible et navigable, distincte d'un simple mockup.
- Au moins un matériau de pavage testé en répétition et un dôme turquoise sur un modèle.
- Des captures réelles du build pour remplacer les statuts « non audité » du registre.
- Aucun lien, achat, déplacement ou effet météo présenté comme fonctionnel avant test.
