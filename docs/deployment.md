# Deployment

Production deployment remains manual. The workflow can upload a fictional-data release only after its explicit confirmation gates pass. Real family data and private media remain outside the deployment workflow.

## Required GitHub secrets

All hosting connection fields are confidential, including values that are not passwords. Store them as encrypted repository secrets and never print them in workflow logs.

- `OVH_SFTP_HOST`
- `OVH_SFTP_PORT`
- `OVH_SFTP_USERNAME`
- `OVH_SFTP_PASSWORD`
- `OVH_REMOTE_PATH`
- `OVH_SFTP_HOST_KEY`

Application secrets such as the Laravel application key, database credentials, and family access password hash must remain in the production `.env` file managed directly on the server. They must not be uploaded from the public repository.

Because the production database is shared at hosting-account level, the application must use its dedicated `noraa_family_` table prefix. Its session cookie must also use the project-specific name documented in `.env.example`. These boundaries prevent collisions with unrelated sites on the same hosting plan.

## Safety gates

Before enabling automated deployment:

1. back up and verify the existing domain directory;
2. confirm the dedicated remote path exactly;
3. create and test dedicated prefixed tables in the shared database;
4. enable separate hosting logs for the domain;
5. configure the domain-specific PHP runtime;
6. test authentication and brute-force protection locally;
7. verify that private media cannot be requested without a valid session;
8. perform a dry-run that lists intended changes without deleting remote files;
9. define a rollback archive and database restore command;
10. approve the first production deployment manually.

## First deployment procedure

1. Download and retain a dated backup of the current domain directory.
2. In the hosting control panel, enable separate logs for the domain.
3. Set the domain document root to the application's `public` directory only after the release has been uploaded.
4. Confirm that the domain uses the repository's PHP version from `.ovhconfig` without changing the hosting account's global PHP version.
5. Create the production `.env` directly in the remote application root. Do not upload it through GitHub Actions.
6. Configure the dedicated database name, credentials, `noraa_family_` prefix, encrypted sessions, secure cookies, application key, and family password hash in that file.
7. Add the six repository secrets listed above and protect the GitHub `production` environment.
8. Run the deployment workflow manually from `main`, type `DEPLOY`, and confirm that the backup exists.
9. Verify the public home, protected tree, login failure, logout, HTTPS cookies, security headers, and separate logs.

The first workflow intentionally uploads without deleting any remote file. A deletion-enabled synchronisation must not be introduced until the remote boundary and rollback procedure have both been exercised successfully.

## Production environment values

Production must set at least:

- `APP_ENV=production`, `APP_DEBUG=false`, the HTTPS application URL, and a unique generated `APP_KEY`;
- the dedicated database connection and `DB_PREFIX=noraa_family_`;
- `SESSION_DRIVER=database`, `SESSION_ENCRYPT=true`, `SESSION_SECURE_COOKIE=true`, and `SESSION_COOKIE=noraa-family-session`;
- a password hash in `FAMILY_ACCESS_PASSWORD_HASH`, never the plain-text password;
- conservative production logging such as `LOG_LEVEL=warning`.

Run database migrations only after checking the generated SQL table names use the dedicated prefix. This is a manual first-deployment step and is not performed by the upload workflow.

## Deployment boundary

The workflow may write only inside the dedicated application directory supplied through the `OVH_REMOTE_PATH` secret. It rejects empty, root, current-directory, parent-directory, and traversal values. It must not synchronise with deletion enabled until the boundary has been independently verified.
