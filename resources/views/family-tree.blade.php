<!doctype html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, nofollow, noarchive">
    <meta name="theme-color" content="#f4efe6">
    <title>Noraä — Arbre familial</title>
    <meta name="description" content="Explorez les branches et les histoires de la famille Noraä.">
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body>
<a class="skip-link" href="#tree-stage">Aller à l’arbre</a>

@if ($familyData !== null)
    <script type="application/json" data-family-tree-data>{!! json_encode($familyData, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE) !!}</script>
@endif

<main class="app-shell" data-family-tree>
    <header class="topbar">
        <div class="brand-block">
            <div class="brand-mark" aria-hidden="true">N</div>
            <div>
                <p class="eyebrow">Mémoire familiale</p>
                <h1>Noraä</h1>
            </div>
        </div>

        <form class="search" role="search" data-search-form>
            <label class="sr-only" for="person-search">Rechercher une personne</label>
            <span aria-hidden="true">⌕</span>
            <input id="person-search" type="search" placeholder="Rechercher une personne…" autocomplete="off" data-search>
            <div class="search-results" data-search-results hidden></div>
        </form>

        <div class="topbar-actions">
            <button class="quiet-button" type="button" data-open-about>À propos</button>
            <form method="post" action="{{ route('family-access.logout') }}">
                @csrf
                <button class="quiet-button" type="submit">Se déconnecter</button>
            </form>
        </div>
    </header>

    <section class="intro" aria-labelledby="tree-heading">
        <div>
            <p class="eyebrow">Plusieurs générations, une histoire</p>
            <h2 id="tree-heading">Notre arbre familial</h2>
            <p>Faites glisser l’arbre pour le parcourir, zoomez pour prendre du recul et sélectionnez une personne pour découvrir son histoire.</p>
        </div>
        <div class="legend" aria-label="Légende">
            <span><i class="legend-line parent"></i>Filiation</span>
            <span><i class="legend-line union"></i>Union</span>
            <span class="fiction-badge">{{ $isPrivateData ? 'Données familiales' : 'Données fictives' }}</span>
        </div>
    </section>

    <section class="tree-frame" aria-label="Arbre généalogique interactif">
        <div class="tree-toolbar" aria-label="Commandes de l’arbre">
            <button type="button" data-zoom-in aria-label="Zoomer">+</button>
            <button type="button" data-zoom-out aria-label="Dézoomer">−</button>
            <button type="button" class="recenter" data-recenter>Recentrer</button>
        </div>

        <div id="tree-stage" class="tree-stage" tabindex="0" data-stage>
            <p class="tree-loading" data-tree-loading>Construction de l’arbre…</p>
            <div class="tree-canvas" data-canvas aria-live="polite">
                <svg class="connections" viewBox="0 0 1400 820" aria-hidden="true" data-connections></svg>
            </div>
            <p class="drag-hint" data-drag-hint>Glissez pour explorer</p>
        </div>
    </section>

    <p class="privacy-note">
        {{ $isPrivateData
            ? 'Espace familial privé — les informations affichées sont réservées aux personnes autorisées.'
            : 'Prototype visuel — toutes les personnes et informations affichées sont fictives.' }}
    </p>
</main>

<aside class="person-drawer" data-drawer aria-hidden="true" aria-labelledby="drawer-name">
    <button class="drawer-close" type="button" data-close-drawer aria-label="Fermer la fiche">×</button>
    <div class="drawer-hero" data-drawer-portrait>JM</div>
    <p class="eyebrow" data-drawer-relation>Point de départ</p>
    <h2 id="drawer-name" data-drawer-name>Jeanne Morel</h2>
    <p class="lifespan" data-drawer-lifespan>1948 — aujourd’hui</p>
    <dl class="facts" data-drawer-facts></dl>
    <section class="story">
        <h3>Informations complémentaires</h3>
        <p data-drawer-story></p>
    </section>
    <section>
        <div class="section-title"><h3>Photos et documents</h3><span>{{ $isPrivateData ? 'À venir' : '3 éléments' }}</span></div>
        @unless ($isPrivateData)
        <div class="gallery" aria-label="Aperçu de la galerie">
            <div class="gallery-item warm">Portrait</div>
            <div class="gallery-item paper">Acte</div>
            <div class="gallery-item landscape">Lieu</div>
        </div>
        @endunless
    </section>
</aside>
<div class="backdrop" data-backdrop hidden></div>

<dialog class="about-dialog" data-about-dialog>
    <button type="button" class="drawer-close" data-close-about aria-label="Fermer">×</button>
    <p class="eyebrow">À propos</p>
    <h2>Un lieu pour transmettre</h2>
    <p>Ce projet rassemble les recherches familiales, les photographies et les sources d’archives dans une expérience simple à explorer.</p>
    <p class="dialog-note">
        {{ $isPrivateData
            ? 'Les informations familiales sont chargées depuis un stockage privé séparé du code public.'
            : 'Cette version utilise uniquement des informations fictives.' }}
    </p>
</dialog>
</body>
</html>
