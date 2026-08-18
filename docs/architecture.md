# Architecture and hosting

## Known constraints

- domain: `noraaesprit.fr`;
- reserved application path: `/familiy-tree`;
- hosting provider: OVH;
- one production environment, keeping operations simple;
- public GitHub repository for source code only;
- private data, media, and secrets stored outside GitHub.

## Provisional target architecture

The application will consist of a web interface, a server-side API, a private database, and private media storage. Authentication must be validated on the server before the API or family files are served.

The final technology choice depends on the exact OVH product: shared PHP/MySQL hosting, VPS, Public Cloud, or another offer. We will prefer the simplest secure solution supported by the existing plan.

## Existing website integration

Two options will be assessed:

1. retain WordPress for the main website and deploy the application under `/familiy-tree` through server configuration or a reverse proxy;
2. replace WordPress if the existing website has no other purpose and removal significantly simplifies operations.

WordPress must not be removed before an inventory, complete backup, and explicit approval.

## Deployment

- reference branch: `main`;
- automated code validation before deployment;
- one production deployment to OVH after checks pass;
- secrets injected through OVH configuration or environment variables;
- backed-up and reversible database migrations;
- documented rollback procedure.

## Backups

- encrypted database or encrypted database backups;
- private media included in a separate backup;
- at least one copy stored outside the OVH hosting account;
- periodic restoration test;
- retention policy agreed with the family.

## Minimum observability

- page availability;
- server errors without personal data in logs;
- abnormal authentication attempts;
- disk usage and backup completion.
