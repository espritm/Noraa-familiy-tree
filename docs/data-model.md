# Data model

The model must preserve uncertainty and provenance instead of forcing every fact into a single, artificially precise value.

## Core entities

### Person

- opaque internal identifier;
- given names in civil-record order;
- optional preferred given name;
- birth name;
- optional customary or married name;
- sex or gender when useful for representation, including an unknown value;
- living, deceased, or unknown status;
- biographical summary;
- optional primary media item;
- visibility level.

### Relationship

- parent-to-child link with biological, adoptive, or other type when known;
- partnership between two people, independent from parentage;
- optional start and end dates and places;
- source and confidence level.

### Event

- type: birth, baptism, marriage, residence, occupation, death, burial, or custom event;
- structured date supporting exact, approximate, before, after, and date-range values;
- structured place and historical label;
- description;
- participants;
- sources.

### Media

- private original and optimised variants;
- type, title, caption, date, and rights holder;
- alternative text for accessibility;
- people identified in the image;
- source and visibility level;
- fingerprint for duplicate detection.

### Source

- document type;
- archival reference, call number, municipality, register, page, or image number;
- durable URL when available;
- transcription and commentary;
- associated media;
- confidence level.

## Rules

- no parentage link may make a person their own ancestor;
- incompatible dates produce a warning rather than a silent correction;
- disputed information may retain several sourced hypotheses;
- significant administrative deletions must be recoverable;
- data about living people is minimised and hidden according to the agreed policy.

## Demonstration data

The public repository may include a small fictional tree for testing and screenshots. Its names, dates, places, images, and references must not correspond to real relatives.
