# Architecture et hébergement

## Contraintes connues

- domaine : `noraaesprit.fr` ;
- chemin public réservé : `/familiy-tree` ;
- hébergement : OVH ;
- un seul environnement de production, conformément au besoin de simplicité ;
- dépôt GitHub public pour le code uniquement ;
- données, médias et secrets privés hors de GitHub.

## Architecture cible provisoire

L'application sera composée d'une interface web, d'une API exécutée côté serveur, d'une base de données privée et d'un stockage privé pour les médias. L'authentification doit être validée côté serveur avant que l'API ou les fichiers familiaux ne soient servis.

Le choix final dépend du type d'offre OVH : hébergement mutualisé avec PHP/MySQL, VPS, Public Cloud ou autre. La solution la plus simple compatible avec l'offre existante sera privilégiée.

## Intégration au site existant

Deux options seront évaluées :

1. conserver WordPress pour le site principal et déployer l'application sous `/familiy-tree` via configuration du serveur ou reverse proxy ;
2. remplacer WordPress si le site existant n'a pas d'autre usage et si cela simplifie nettement l'exploitation.

WordPress ne doit pas être supprimé avant inventaire, sauvegarde complète et validation explicite.

## Déploiement

- branche de référence : `main` ;
- validation automatique du code avant déploiement ;
- déploiement unique vers OVH après succès des contrôles ;
- secrets injectés dans la configuration OVH ou dans des variables d'environnement ;
- migrations de base de données sauvegardées et réversibles ;
- procédure de retour à la version précédente.

## Sauvegardes

- base de données chiffrée ou sauvegarde chiffrée ;
- médias privés inclus dans une sauvegarde distincte ;
- au moins une copie hors de l'hébergement OVH ;
- test périodique de restauration ;
- politique de rétention à définir avec la famille.

## Observabilité minimale

- disponibilité de la page ;
- erreurs serveur sans données personnelles dans les journaux ;
- tentatives d'authentification anormales ;
- espace disque et réussite des sauvegardes.
