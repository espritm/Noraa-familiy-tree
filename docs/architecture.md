# Architecture and hosting

## Known constraints

- domain: `noraaesprit.fr`;
- reserved application path: `/familiy-tree`;
- hosting: an OVH shared Personal plan;
- isolated multisite document root dedicated to this domain;
- PHP 8.4 selected through a site-specific `.ovhconfig`;
- one production environment, keeping operations simple;
- public GitHub repository for source code only;
- private data, media, hosting identifiers, and secrets stored outside GitHub.

## Target architecture

The application uses Laravel 13 as its server-side framework. Laravel owns routing, sessions, authentication, authorisation, rate limiting, database access, validation, private media delivery, and security headers. The interactive tree is delivered as compiled browser assets and communicates only with authenticated server routes once real data is introduced.

Production uses a dedicated MySQL database rather than reusing any database belonging to another site. Private media lives under Laravel's non-public storage directory and is streamed through authorised application routes. Only the `public/` directory is exposed by the web server.

## Hosting isolation

The hosting account contains unrelated websites. Deployment automation must therefore target only the dedicated application directory. It must never enumerate, modify, delete, or deploy into sibling directories.

The domain's multisite document root will eventually point to the application's `public/` directory. The hosting account's global configuration is left unchanged; this repository's `.ovhconfig` applies PHP 8.4 to this application only.

## Existing website replacement

The current empty WordPress installation may be removed only after:

1. recording its exact dedicated document root;
2. downloading a complete file backup;
3. identifying its table prefix in the shared legacy database;
4. exporting those tables;
5. verifying the backup locally;
6. preparing a rollback archive.

No shared database or unrelated table may be deleted as part of this replacement.

## Deployment

- reference branch: `main`;
- pull requests validated by GitHub Actions;
- front-end assets and production Composer dependencies built before upload;
- SFTP connection values stored exclusively as encrypted GitHub secrets;
- deployment restricted to the dedicated remote application path;
- database migrations backed up and run separately from file upload;
- documented rollback to the previous release.

## Backups

- encrypted database exports;
- private media included in a separate encrypted backup;
- at least one copy stored outside OVH;
- periodic restoration tests;
- no reliance on an FTP file copy alone, because it does not protect database contents.

## Logging and monitoring

- enable separate hosting logs for this domain before production launch;
- keep application logs free of genealogical payloads and secrets;
- record authentication failures with minimal metadata;
- monitor availability, disk usage, failed logins, and backup completion;
- define log retention and deletion periods before real family data is imported.
