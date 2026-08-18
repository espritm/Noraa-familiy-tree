# Noraä Family Tree

Site familial permettant d'explorer un arbre généalogique interactif et les documents qui racontent l'histoire de la famille.

## Objectif

Le projet vise une consultation agréable sur ordinateur, tablette et mobile : zoom, déplacement libre, suivi des branches, recherche d'une personne et ouverture d'une fiche détaillée avec photographies et sources.

Le site sera hébergé sur OVH. Sa page principale est destinée à être publiée à l'adresse `https://noraaesprit.fr/familiy-tree` et protégée par une authentification partagée avec les proches autorisés.

> [!IMPORTANT]
> Ce dépôt est public et ne doit contenir aucune donnée généalogique réelle, photographie familiale, archive, adresse, identifiant ou secret. Les exemples versionnés sont entièrement fictifs.

## État du projet

Le projet est en phase de cadrage. La documentation fonctionnelle et technique se trouve dans [`docs/`](docs/README.md).

## Principes

- priorité à la lisibilité et à la navigation dans les grandes branches ;
- respect de la vie privée, en particulier pour les personnes vivantes ;
- séparation stricte entre code public et données familiales privées ;
- traçabilité des informations grâce aux sources d'archives ;
- solution simple à exploiter et à sauvegarder sur un hébergement OVH unique ;
- accessibilité et compatibilité mobile dès la conception.

## Documentation

- [Vision du produit](docs/vision-produit.md)
- [Fonctionnalités](docs/fonctionnalites.md)
- [Modèle de données](docs/modele-de-donnees.md)
- [Architecture et hébergement](docs/architecture.md)
- [Confidentialité et sécurité](docs/confidentialite-securite.md)
- [Numérisation et import des archives](docs/import-des-archives.md)
- [Décisions à prendre](docs/decisions-ouvertes.md)

## Contribuer

Avant tout commit, vérifier qu'aucun contenu privé n'est présent dans les fichiers, l'historique Git ou les métadonnées des médias. Les secrets seront fournis uniquement au service d'hébergement par son gestionnaire de secrets ou sa configuration serveur.

## Licence

Aucune licence n'est accordée pour le moment. Tous droits réservés.
