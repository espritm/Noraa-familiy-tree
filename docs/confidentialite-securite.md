# Confidentialité et sécurité

## Séparation public/privé

Le dépôt GitHub est public mais ne contient que le code, la documentation et des exemples fictifs. Les données généalogiques, médias familiaux, exports, sauvegardes et secrets restent dans des stockages privés.

Le caractère public de la page d'accueil du domaine ne rend pas publiques les données de `/familiy-tree` : aucune donnée privée ne doit être incluse dans le HTML initial, un bundle JavaScript, un cache public, un plan de site ou des métadonnées sociales avant authentification.

## Authentification

Le mot de passe sera défini directement dans la configuration sécurisée de l'hébergement, jamais envoyé dans GitHub ni dans cette conversation. Il sera stocké sous forme de dérivé cryptographique robuste, pas en clair.

Une authentification partagée est acceptable pour une première version familiale, avec les protections suivantes :

- HTTPS obligatoire et cookies de session `Secure`, `HttpOnly` et `SameSite` ;
- limitation du nombre de tentatives par adresse IP et par session ;
- délais progressifs après échecs et blocage temporaire ;
- journalisation minimale des échecs, sans enregistrer le mot de passe ;
- protection CSRF, validation des entrées et en-têtes de sécurité ;
- expiration des sessions et possibilité de révoquer toutes les sessions ;
- réponse uniforme afin de ne pas révéler d'information utile à un attaquant.

Un CAPTCHA ne sera ajouté qu'en cas de besoin : la limitation serveur et le blocage progressif sont prioritaires. Une étape ultérieure pourra remplacer le mot de passe partagé par des comptes individuels ou des liens d'invitation révocables.

## Personnes vivantes

Par défaut, seules les informations strictement nécessaires sont affichées pour une personne vivante. Les dates complètes, coordonnées, documents administratifs et informations sensibles sont exclus. La politique exacte devra être validée par la famille et respecter les demandes de retrait ou correction.

## Médias et archives

- suppression des métadonnées EXIF non nécessaires avant publication ;
- miniatures et variantes servies après authentification ;
- noms de fichiers non signifiants ;
- contrôle des types et tailles lors de l'envoi ;
- originaux privés non exposés par une URL devinable ;
- droits et consentements documentés lorsque nécessaire.

## Référencement et cache

La route protégée doit envoyer des directives empêchant l'indexation et le cache public. Cela complète l'authentification mais ne la remplace pas.

## Réponse à un incident

En cas d'exposition : désactiver l'accès, révoquer les secrets et sessions, préserver les journaux utiles, identifier les données concernées, corriger la cause puis informer les personnes affectées lorsque nécessaire.
