# Deployment

Production deployment is intentionally disabled until authentication, private media delivery, backups, and rollback have been tested.

## Required GitHub secrets

All hosting connection fields are confidential, including values that are not passwords. Store them as encrypted repository secrets and never print them in workflow logs.

- `OVH_SFTP_HOST`
- `OVH_SFTP_PORT`
- `OVH_SFTP_USERNAME`
- `OVH_SFTP_PASSWORD`
- `OVH_REMOTE_PATH`

Application secrets such as the Laravel application key, database credentials, and family access password hash must remain in the production `.env` file managed directly on the server. They must not be uploaded from the public repository.

## Safety gates

Before enabling automated deployment:

1. back up and verify the existing domain directory;
2. confirm the dedicated remote path exactly;
3. create and test a dedicated database;
4. enable separate hosting logs for the domain;
5. configure the domain-specific PHP runtime;
6. test authentication and brute-force protection locally;
7. verify that private media cannot be requested without a valid session;
8. perform a dry-run that lists intended changes without deleting remote files;
9. define a rollback archive and database restore command;
10. approve the first production deployment manually.

## Deployment boundary

The workflow may write only inside the dedicated application directory. It must not use a broad remote path, traverse parent directories, or synchronise with deletion enabled until the boundary has been independently verified.
