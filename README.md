# Noraä Family Tree

A private family website for exploring an interactive family tree and the historical records that tell the family's story.

## Goal

The project aims to provide a comfortable experience on desktop, tablet, and mobile: zooming, free panning, following family branches, searching for a person, and opening a detailed profile with photographs and sources.

The site will be hosted by OVH. The application is intended to be available at `https://noraaesprit.fr/familiy-tree` behind authentication shared with authorised relatives.

> [!IMPORTANT]
> This repository is public. It must never contain real genealogical data, family photographs, archival documents, addresses, credentials, or secrets. All committed examples must be entirely fictional.

## Project status

The project is currently in the discovery and specification phase. Functional and technical documentation is available in [`docs/`](docs/README.md).

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
- [Open decisions](docs/open-decisions.md)

## Contributing

Before every commit, verify that no private content appears in files, Git history, logs, or media metadata. Secrets must only be supplied through the hosting provider's secret management or server configuration.

Website interface strings and user-facing content are written in French. Source code, commit messages, specifications, and technical documentation are written in English.

## Licence

No licence is granted at this time. All rights reserved.
