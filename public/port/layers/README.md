# Port de Blacklace Island — vrais plans de parallaxe

Les **sept images découpées existent déjà dans les fichiers de travail** : `/mnt/data/blacklace_port_cinematic_layers/` et `blacklace_port_cinematic_layers.zip`. Elles ne sont pas encore publiées sur GitHub.

Dimensions identiques : **1672 × 941**. Les six plans supérieurs sont RGBA ; le fond est RGB.

Fichiers à déposer sans renommage dans ce répertoire :

1. `00_background.png` — fond et ciel
2. `01_mountains.png` — montagnes / volcan
3. `02_village.png` — bâtiments
4. `03_quay.png` — quai
5. `04_foreground.png` — premier plan
6. `05_left_props.png` — accessoires à gauche
7. `06_right_flowers.png` — fleurs à droite

Le chargeur attend **les sept fichiers**, vérifie leur taille et ne remplace le panorama diurne qu'après chargement complet. Le panorama nocturne existant reste utilisé la nuit.

**Attention :** le manifeste des découpes indique des masques polygonaux approximatifs et un fond non reconstitué derrière les objets. Les amplitudes sont donc volontairement faibles. Un nettoyage des masques et des zones occultées sera nécessaire avant de pousser la parallaxe plus loin.

Ne pas fusionner en prétendant que les PNG sont déjà en ligne : leur transfert binaire dans le dépôt reste à faire.
