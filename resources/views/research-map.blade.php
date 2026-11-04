<!doctype html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, nofollow, noarchive">
    <meta name="theme-color" content="#f4efe6">
    <title>Noraä — Carte de recherche</title>
    <meta name="description" content="Explorez les branches, les sources et les chaînons manquants de la recherche familiale.">
    @vite(['resources/css/app.css', 'resources/js/research-map.js'])
</head>
<body>
<a class="skip-link" href="#research-stage">Aller à la carte</a>

@if ($researchData !== null)
    <script type="application/json" data-research-map-data>{!! json_encode($researchData, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE) !!}</script>
@endif

<main class="app-shell" data-research-map>
    <header class="topbar">
        <div class="brand-block">
            <div class="brand-mark" aria-hidden="true">N</div>
            <div>
                <p class="eyebrow">Mémoire familiale</p>
                <h1>Noraä</h1>
            </div>
        </div>

        <form class="search" role="search" data-search-form>
            <label class="sr-only" for="research-search">Rechercher dans les recherches</label>
            <span aria-hidden="true">⌕</span>
            <input id="research-search" type="search" placeholder="Rechercher parmi toutes les personnes…" autocomplete="off" data-search>
            <div class="search-results" data-search-results hidden></div>
        </form>

        <div class="topbar-actions">
            <a class="quiet-button quiet-link" href="{{ route('family-tree') }}">Arbre familial</a>
            <button class="quiet-button" type="button" data-open-about>À propos</button>
            <form method="post" action="{{ route('family-access.logout') }}">
                @csrf
                <button class="quiet-button" type="submit">Se déconnecter</button>
            </form>
        </div>
    </header>

    <section class="intro research-intro" aria-labelledby="research-heading">
        <div>
            <p class="eyebrow">Assembler les indices</p>
            <h2 id="research-heading">Carte de recherche</h2>
            <p>Explorez toutes les personnes recensées, y compris les branches encore incomplètes. Les zones et les couleurs distinguent les faits établis des pistes à résoudre.</p>
        </div>
        @if ($researchStats !== null)
        <div class="research-metrics" aria-label="État de la recherche">
            <span><strong>{{ $researchStats['displayed'] }}</strong> dans l’arbre</span>
            <span><strong>{{ $researchStats['total'] }}</strong> recensées</span>
            <span><strong>{{ $researchStats['openLinks'] }}</strong> chaînons prioritaires</span>
        </div>
        @endif
    </section>

    @if ($researchData !== null)
    <div class="research-workspace">
        <aside class="research-sidebar" aria-label="Priorités de recherche">
            <section>
                <p class="eyebrow">Avancée récente</p>
                @foreach ($researchData['discoveries'] as $discovery)
                    <article class="research-task resolved">
                        <span class="task-status">Raccordement confirmé</span>
                        <h3>{{ $discovery['title'] }}</h3>
                        <p>{{ $discovery['summary'] }}</p>
                        <small>{{ $discovery['impact'] ?? '' }}</small>
                        <button type="button" data-focus-people="{{ implode(',', $discovery['focus_person_ids'] ?? []) }}">Voir sur la carte</button>
                    </article>
                @endforeach
            </section>

            <section>
                <p class="eyebrow">Chaînons manquants</p>
                @foreach ($researchData['missing_links'] as $missingLink)
                    <article class="research-task priority-{{ $missingLink['priority'] ?? 3 }}">
                        <span class="task-status">Priorité {{ $missingLink['priority'] ?? 'à étudier' }}</span>
                        <h3>{{ $missingLink['title'] }}</h3>
                        <p>{{ $missingLink['summary'] }}</p>
                        @if (isset($missingLink['impact_people_count']))
                            <small>Résolution potentielle : {{ $missingLink['impact_people_count'] }} personnes concernées</small>
                        @endif
                        <button type="button" data-focus-people="{{ implode(',', $missingLink['focus_person_ids'] ?? []) }}">Localiser le problème</button>
                    </article>
                @endforeach
            </section>

            <section class="confidence-key">
                <p class="eyebrow">Lecture</p>
                <span><i class="confidence-dot certain"></i>Information établie</span>
                <span><i class="confidence-dot probable"></i>Information probable</span>
                <span><i class="confidence-dot uncertain"></i>Information incertaine</span>
            </section>
        </aside>

        <section class="tree-frame research-frame" aria-label="Carte panoramique des recherches généalogiques">
            <div class="tree-toolbar" aria-label="Commandes de la carte">
                <button type="button" data-zoom-in aria-label="Zoomer">+</button>
                <button type="button" data-zoom-out aria-label="Dézoomer">−</button>
                <button type="button" class="recenter" data-recenter>Tout afficher</button>
            </div>
            <div id="research-stage" class="tree-stage" tabindex="0" data-stage>
                <p class="tree-loading" data-tree-loading>Construction de la carte de recherche…</p>
                <div class="tree-canvas research-canvas" data-canvas aria-live="polite">
                    <svg class="connections research-connections" viewBox="0 0 1600 1000" aria-hidden="true" data-connections></svg>
                </div>
                <p class="drag-hint" data-drag-hint>Glissez pour explorer les zones</p>
            </div>
        </section>
    </div>
    @else
        <section class="research-empty"><h2>Carte indisponible</h2><p>Le jeu de recherche privé n’a pas encore été synchronisé.</p></section>
    @endif

    <p class="privacy-note">Espace familial privé — les hypothèses sont distinguées des filiations établies et ne sont jamais présentées comme des certitudes.</p>
</main>

<aside class="person-drawer" data-drawer aria-hidden="true" aria-labelledby="research-drawer-name">
    <button class="drawer-close" type="button" data-close-drawer aria-label="Fermer la fiche">×</button>
    <div class="drawer-hero" data-drawer-portrait>?</div>
    <p class="eyebrow" data-drawer-relation>Recherche</p>
    <h2 id="research-drawer-name" data-drawer-name>Personne</h2>
    <p class="lifespan" data-drawer-lifespan>Date inconnue</p>
    <dl class="facts" data-drawer-facts></dl>
    <section class="story"><h3>Sources et variantes</h3><p data-drawer-story></p></section>
</aside>
<div class="backdrop" data-backdrop hidden></div>

<dialog class="about-dialog" data-about-dialog>
    <button type="button" class="drawer-close" data-close-about aria-label="Fermer">×</button>
    <p class="eyebrow">À propos de cette carte</p>
    <h2>Un atelier de recherche visuel</h2>
    <p>Cette page rassemble les personnes extraites des carnets et les informations familiales. Une personne peut y apparaître sans être encore raccordée à l’arbre principal.</p>
    <p class="dialog-note">Un trait ou une carte orange signale une piste de recherche, jamais une filiation affirmée.</p>
</dialog>
</body>
</html>
