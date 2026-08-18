# Modèle de données

Le modèle doit conserver les incertitudes et les sources, plutôt que forcer une valeur unique artificiellement précise.

## Entités principales

### Personne

- identifiant interne non signifiant ;
- prénoms, dans leur ordre d'état civil ;
- prénom usuel facultatif ;
- nom de naissance ;
- nom d'usage facultatif ;
- sexe ou genre si utile à la représentation, avec valeur inconnue possible ;
- indicateur vivant/décédé/inconnu ;
- résumé biographique ;
- média principal facultatif ;
- niveau de visibilité.

### Relation

- parent vers enfant, avec nature biologique, adoptive ou autre si elle est connue ;
- union entre deux personnes, indépendante de la filiation ;
- dates et lieux de début ou fin d'union facultatifs ;
- source et degré de certitude.

### Événement

- type : naissance, baptême, mariage, résidence, profession, décès, inhumation ou événement libre ;
- date structurée pouvant être exacte, approximative, antérieure, postérieure ou comprise dans une période ;
- lieu structuré et libellé historique ;
- description ;
- participants ;
- sources.

### Média

- fichier original privé et variantes optimisées ;
- type, titre, légende, date et détenteur des droits ;
- texte alternatif pour l'accessibilité ;
- personnes identifiées dans l'image ;
- source et niveau de visibilité ;
- empreinte permettant de détecter les doublons.

### Source

- type de document ;
- référence d'archive, cote, commune, registre, page ou vue ;
- URL si elle est pérenne ;
- transcription et commentaire ;
- média associé ;
- niveau de confiance.

## Règles

- aucune relation de parenté ne peut rendre une personne son propre ascendant ;
- les dates incompatibles produisent un avertissement, pas une correction silencieuse ;
- une information contestée peut conserver plusieurs hypothèses sourcées ;
- les suppressions administratives importantes doivent être récupérables ;
- les données d'une personne vivante sont minimisées et masquées selon la politique choisie.

## Données de démonstration

Le dépôt public pourra contenir un petit arbre fictif destiné aux tests et aux captures d'écran. Les noms, dates, lieux, images et références ne devront correspondre à aucun membre réel de la famille.
