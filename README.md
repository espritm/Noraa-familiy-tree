# Noraä Family Tree

A private family website for exploring an interactive family tree and the historical records that tell the family's story.

## Goal

The project aims to provide a comfortable experience on desktop, tablet, and mobile: zooming, free panning, following family branches, searching for a person, and opening a detailed profile with photographs and sources.

The application is intended to be available at `https://noraaesprit.fr/familiy-tree` behind authentication shared with authorised relatives.

> [!IMPORTANT]
> This repository is public. It must never contain real genealogical data, family photographs, archival documents, hosting identifiers, addresses, credentials, or secrets. All committed examples must be entirely fictional.

## Project status

The project is in its first implementation phase. The current prototype provides a French interactive tree backed by fictional in-memory data. Authentication, private persistence, and production deployment are intentionally not enabled yet.

## Technology

- Laravel 13 and PHP 8.4;
- Blade, modern CSS, and browser JavaScript for the first interactive slice;
- Vite for front-end assets;
- MySQL for the future private production database;
- PHPUnit and GitHub Actions for validation;
- SFTP deployment to OVH only after authentication and private storage are complete.

## Local development

The repository includes a Docker-based workflow so PHP and Composer do not need to be installed globally.

```bash
docker run --rm -v "$PWD:/app" -w /app composer:2 composer install
npm install
npm run build
docker run --rm -p 8000:8000 -v "$PWD:/app" -w /app php:8.4-cli php artisan serve --host=0.0.0.0
```

Copy `.env.example` to `.env`, generate an application key, and configure a local database before exercising persistence features. Never commit `.env`.

## Principles

- prioritise readability and navigation across large family branches;
- protect privacy, especially for living people;
- strictly separate public source code from private family data;
- make historical claims traceable to their sources;
- keep hosting, deployment, and backups simple;
- design for accessibility and mobile devices from the start.

## Documentation

- [Product vision](docs/product-vision.md)
- [Features](docs/features.md)
- [Data model](docs/data-model.md)
- [Architecture and hosting](docs/architecture.md)
- [Privacy and security](docs/privacy-and-security.md)
- [Archive digitisation and import](docs/archive-digitisation.md)
- [Deployment](docs/deployment.md)
- [Open decisions](docs/open-decisions.md)

## Language convention

Website interface strings and user-facing content are written in French. Source code, commit messages, specifications, and technical documentation are written in English.

## Licence

No licence is granted at this time. All rights reserved.
