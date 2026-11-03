import { layoutFamilyTree } from './family-tree-layout.js';

const fictionalPeople = {
    jeanne: { name: 'Jeanne Morel', relation: 'Membre de la famille', lifespan: '1948 — aujourd’hui', initials: 'JM', birth: '14 mai 1948', place: 'Tours, France', occupation: 'Institutrice', source: 'Données fictives', story: 'Jeanne a grandi près de la Loire. Passionnée par les récits transmis lors des réunions de famille, elle a conservé lettres, photographies et souvenirs pour les générations suivantes.' },
    lucien: { name: 'Lucien Morel', relation: 'Membre de la famille', lifespan: '1919 — 1998', initials: 'LM', birth: '2 mars 1919', place: 'Blois, France', occupation: 'Menuisier', source: 'Données fictives', story: 'Lucien travaillait le bois et notait dans de petits carnets les événements importants de la famille.' },
    madeleine: { name: 'Madeleine Dubois', relation: 'Membre de la famille', lifespan: '1922 — 2007', initials: 'MD', birth: '9 octobre 1922', place: 'Amboise, France', occupation: 'Couturière', source: 'Données fictives', story: 'Madeleine était reconnue pour sa mémoire des visages et des liens qui unissaient les différentes branches familiales.' },
    antoine: { name: 'Antoine Bernard', relation: 'Membre de la famille', lifespan: '1946 — 2021', initials: 'AB', birth: '18 janvier 1946', place: 'Saumur, France', occupation: 'Libraire', source: 'Données fictives', story: 'Antoine aimait collectionner les cartes postales anciennes et raconter l’histoire des villages traversés pendant son enfance.' },
    claire: { name: 'Claire Bernard', relation: 'Membre de la famille', lifespan: 'née en 1973', initials: 'CB', birth: '6 juin 1973', place: 'Tours, France', occupation: 'Architecte', source: 'Données fictives', story: 'Claire rassemble les photographies familiales et documente les lieux qui ont marqué chaque génération.' },
    julien: { name: 'Julien Bernard', relation: 'Membre de la famille', lifespan: 'né en 1977', initials: 'JB', birth: '21 août 1977', place: 'Tours, France', occupation: 'Photographe', source: 'Données fictives', story: 'Julien photographie les maisons et paysages évoqués dans les archives familiales.' },
    auguste: { name: 'Auguste Morel', relation: 'Membre de la famille', lifespan: '1887 — 1958', initials: 'AM', birth: '3 avril 1887', place: 'Vendôme, France', occupation: 'Vigneron', source: 'Données fictives', story: 'Auguste cultivait une petite parcelle et conservait soigneusement les actes et correspondances reçus par la famille.' },
    celestine: { name: 'Célestine Petit', relation: 'Membre de la famille', lifespan: '1892 — 1966', initials: 'CP', birth: '27 novembre 1892', place: 'Chinon, France', occupation: 'Épicière', source: 'Données fictives', story: 'Célestine tenait une épicerie où les nouvelles du voisinage et les histoires familiales circulaient chaque jour.' },
};

const fictionalParentage = [
    { parent_id: 'auguste', child_id: 'lucien' },
    { parent_id: 'celestine', child_id: 'madeleine' },
    { parent_id: 'lucien', child_id: 'jeanne' },
    { parent_id: 'madeleine', child_id: 'jeanne' },
    { parent_id: 'jeanne', child_id: 'claire' },
    { parent_id: 'antoine', child_id: 'claire' },
    { parent_id: 'jeanne', child_id: 'julien' },
    { parent_id: 'antoine', child_id: 'julien' },
];

const root = document.querySelector('[data-family-tree]');

if (root) {
    const stage = root.querySelector('[data-stage]');
    const canvas = root.querySelector('[data-canvas]');
    const connections = root.querySelector('[data-connections]');
    const loading = root.querySelector('[data-tree-loading]');
    const drawer = document.querySelector('[data-drawer]');
    const backdrop = document.querySelector('[data-backdrop]');
    const hint = root.querySelector('[data-drag-hint]');
    const searchInput = root.querySelector('[data-search]');
    const searchResults = root.querySelector('[data-search-results]');
    const privateDataElement = document.querySelector('[data-family-tree-data]');
    const privateData = privateDataElement ? JSON.parse(privateDataElement.textContent) : null;
    const palette = ['gold', 'blue', 'rose', 'green', 'ink'];
    const personCards = new Map();
    const positions = new Map();
    let familyUnits = [];
    let people = fictionalPeople;
    let parentage = fictionalParentage;
    let canvasWidth = 1400;
    let canvasHeight = 820;
    let scale = 0.88;
    let x = 0;
    let y = 0;
    let dragging = false;
    let startX = 0;
    let startY = 0;
    let originX = 0;
    let originY = 0;
    let lastFocused = null;

    const formatDate = (value) => {
        if (!value || typeof value !== 'string') return 'Date inconnue';
        const date = new Date(`${value}T00:00:00`);
        if (Number.isNaN(date.getTime())) return value;
        return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(date);
    };

    const normalisePrivatePeople = (records) => Object.fromEntries(records.map((person) => {
        const givenNames = Array.isArray(person.given_names) ? person.given_names.join(' ') : String(person.given_names || '');
        const birthName = String(person.birth_name || '');
        const customaryName = String(person.customary_name || '');
        const displaySurname = customaryName || birthName;
        const name = [givenNames, displaySurname].filter(Boolean).join(' ') || 'Nom inconnu';
        const initials = `${givenNames.charAt(0)}${displaySurname.charAt(0)}`.toLocaleUpperCase('fr') || '?';
        const birth = formatDate(person.birth_date);
        const death = person.death_date ? formatDate(person.death_date) : null;
        const lifespan = death ? `${birth} — ${death}` : person.living_status === 'living' ? `${birth} — aujourd’hui` : birth;
        const status = person.living_status === 'living' ? 'Vivante ou vivant' : person.living_status === 'deceased' ? 'Décédée ou décédé' : 'Non renseigné';

        return [person.id, {
            name,
            relation: 'Membre de la famille',
            lifespan,
            initials,
            birth,
            birthName: birthName || 'Non renseigné',
            customaryName: customaryName || 'Non renseigné',
            status,
            story: 'Les informations complémentaires seront ajoutées au fil des recherches familiales.',
        }];
    }));

    if (privateData?.people?.length) {
        people = normalisePrivatePeople(privateData.people);
        parentage = privateData.parentage || [];
    }

    const applyTransform = () => {
        canvas.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
    };

    const recenter = () => {
        const horizontalScale = (stage.clientWidth - 80) / canvasWidth;
        const verticalScale = (stage.clientHeight - 80) / canvasHeight;
        const minimumScale = window.innerWidth < 780 ? 0.2 : 0.3;
        scale = Math.min(0.9, Math.max(minimumScale, Math.min(horizontalScale, verticalScale)));
        x = stage.clientWidth / 2 - (canvasWidth / 2) * scale;
        y = stage.clientHeight / 2 - (canvasHeight / 2) * scale;
        applyTransform();
    };

    const zoom = (delta, centerX = stage.clientWidth / 2, centerY = stage.clientHeight / 2) => {
        const previous = scale;
        scale = Math.min(1.4, Math.max(0.2, scale + delta));
        x = centerX - ((centerX - x) / previous) * scale;
        y = centerY - ((centerY - y) / previous) * scale;
        applyTransform();
    };

    const focusPerson = (id) => {
        const card = personCards.get(id);
        const position = positions.get(id);
        if (!card || !position) return;
        x = stage.clientWidth / 2 - (position.x + position.width / 2) * scale;
        y = stage.clientHeight / 2 - (position.y + position.height / 2) * scale;
        applyTransform();
        card.classList.remove('is-highlighted');
        requestAnimationFrame(() => card.classList.add('is-highlighted'));
    };

    const highlightFamilies = (personId) => {
        const selectedFamilies = new Set(familyUnits
            .filter((family) => family.parentIds.includes(personId) || family.childIds.includes(personId))
            .map((family) => family.id));
        const relatedPeople = new Set([personId]);
        familyUnits.filter((family) => selectedFamilies.has(family.id)).forEach((family) => {
            family.parentIds.forEach((id) => relatedPeople.add(id));
            family.childIds.forEach((id) => relatedPeople.add(id));
        });
        personCards.forEach((card, id) => card.classList.toggle('is-family-highlighted', relatedPeople.has(id)));
        connections.querySelectorAll('[data-family-id]').forEach((path) => {
            path.classList.toggle('is-highlighted', selectedFamilies.has(path.dataset.familyId));
        });
    };

    const openDrawer = (id, trigger) => {
        const person = people[id];
        if (!person) return;
        lastFocused = trigger;
        highlightFamilies(id);
        drawer.querySelector('[data-drawer-portrait]').textContent = person.initials;
        drawer.querySelector('[data-drawer-relation]').textContent = person.relation;
        drawer.querySelector('[data-drawer-name]').textContent = person.name;
        drawer.querySelector('[data-drawer-lifespan]').textContent = person.lifespan;
        drawer.querySelector('[data-drawer-story]').textContent = person.story;
        const facts = privateData
            ? [['Naissance', person.birth], ['Nom de naissance', person.birthName], ['Nom d’usage', person.customaryName], ['Statut', person.status]]
            : [['Naissance', person.birth], ['Lieu', person.place], ['Profession', person.occupation], ['Source', person.source]];
        const factsList = drawer.querySelector('[data-drawer-facts]');
        factsList.replaceChildren(...facts.map(([label, value]) => {
            const row = document.createElement('div');
            const term = document.createElement('dt');
            const description = document.createElement('dd');
            term.textContent = label;
            description.textContent = value;
            row.append(term, description);
            return row;
        }));
        drawer.classList.add('open');
        drawer.setAttribute('aria-hidden', 'false');
        backdrop.hidden = false;
        drawer.querySelector('[data-close-drawer]').focus();
    };

    const closeDrawer = () => {
        drawer.classList.remove('open');
        drawer.setAttribute('aria-hidden', 'true');
        backdrop.hidden = true;
        personCards.forEach((card) => card.classList.remove('is-family-highlighted'));
        connections.querySelectorAll('.is-highlighted').forEach((path) => path.classList.remove('is-highlighted'));
        if (lastFocused) lastFocused.focus();
    };

    const createPersonCard = (id, person, position, index) => {
        const card = document.createElement('article');
        card.className = 'person-card';
        card.style.setProperty('--x', `${position.x}px`);
        card.style.setProperty('--y', `${position.y}px`);
        card.dataset.person = id;
        card.tabIndex = 0;
        const portrait = document.createElement('div');
        portrait.className = `portrait portrait-${palette[index % palette.length]}`;
        portrait.textContent = person.initials;
        const details = document.createElement('div');
        const relationship = document.createElement('span');
        relationship.className = 'relationship';
        relationship.textContent = person.relation;
        const heading = document.createElement('h3');
        heading.textContent = person.name;
        const dates = document.createElement('p');
        dates.textContent = person.lifespan;
        details.append(relationship, heading, dates);
        card.append(portrait, details);
        card.addEventListener('click', () => openDrawer(id, card));
        card.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openDrawer(id, card);
            }
        });
        return card;
    };

    const pointsToPath = (points) => points.reduce((path, point, index) => `${path}${index === 0 ? 'M' : ' L'} ${point.x} ${point.y}`, '');

    const renderLayout = (layout) => {
        canvasWidth = Math.max(700, layout.width);
        canvasHeight = Math.max(500, layout.height);
        familyUnits = layout.familyUnits;
        canvas.style.width = `${canvasWidth}px`;
        canvas.style.height = `${canvasHeight}px`;
        connections.style.width = `${canvasWidth}px`;
        connections.style.height = `${canvasHeight}px`;
        connections.setAttribute('viewBox', `0 0 ${canvasWidth} ${canvasHeight}`);
        connections.replaceChildren();
        canvas.querySelectorAll('[data-person]').forEach((card) => card.remove());
        personCards.clear();
        positions.clear();

        layout.families.forEach((family, familyId) => {
            const junction = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            junction.setAttribute('class', 'family-junction');
            junction.setAttribute('cx', String(family.x + family.width / 2));
            junction.setAttribute('cy', String(family.y + family.height / 2));
            junction.setAttribute('r', '4');
            junction.dataset.familyId = familyId;
            connections.appendChild(junction);
        });

        layout.edges.forEach((edge) => {
            if (edge.points.length < 2) return;
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', pointsToPath(edge.points));
            path.setAttribute('class', edge.kind);
            path.dataset.familyId = edge.familyId;
            connections.appendChild(path);
        });

        Object.entries(people).forEach(([id, person], index) => {
            const position = layout.people.get(id);
            if (!position) return;
            const card = createPersonCard(id, person, position, index);
            positions.set(id, position);
            personCards.set(id, card);
            canvas.appendChild(card);
        });
    };

    const updateSearch = () => {
        const query = searchInput.value.trim().toLocaleLowerCase('fr');
        if (!query) {
            searchResults.hidden = true;
            return;
        }
        const matches = Object.entries(people).filter(([, person]) => person.name.toLocaleLowerCase('fr').includes(query));
        if (matches.length) {
            searchResults.replaceChildren(...matches.map(([id, person]) => {
                const result = document.createElement('button');
                result.className = 'search-result';
                result.type = 'button';
                result.dataset.result = id;
                const name = document.createElement('strong');
                name.textContent = person.name;
                const dates = document.createElement('small');
                dates.textContent = person.lifespan;
                result.append(name, document.createElement('br'), dates);
                return result;
            }));
        } else {
            const empty = document.createElement('p');
            empty.className = 'search-result';
            empty.textContent = 'Aucun résultat';
            searchResults.replaceChildren(empty);
        }
        searchResults.hidden = false;
    };

    stage.addEventListener('pointerdown', (event) => {
        if (event.target.closest('.person-card')) return;
        dragging = true;
        startX = event.clientX;
        startY = event.clientY;
        originX = x;
        originY = y;
        stage.classList.add('is-dragging');
        stage.setPointerCapture(event.pointerId);
        hint.classList.add('hidden');
    });
    stage.addEventListener('pointermove', (event) => {
        if (!dragging) return;
        x = originX + event.clientX - startX;
        y = originY + event.clientY - startY;
        applyTransform();
    });
    stage.addEventListener('pointerup', () => {
        dragging = false;
        stage.classList.remove('is-dragging');
    });
    stage.addEventListener('wheel', (event) => {
        event.preventDefault();
        const rect = stage.getBoundingClientRect();
        zoom(event.deltaY > 0 ? -0.08 : 0.08, event.clientX - rect.left, event.clientY - rect.top);
    }, { passive: false });
    stage.addEventListener('keydown', (event) => {
        const amount = event.shiftKey ? 80 : 30;
        if (event.key === 'ArrowLeft') x += amount;
        else if (event.key === 'ArrowRight') x -= amount;
        else if (event.key === 'ArrowUp') y += amount;
        else if (event.key === 'ArrowDown') y -= amount;
        else if (event.key === '+' || event.key === '=') zoom(.08);
        else if (event.key === '-') zoom(-.08);
        else if (event.key === '0') recenter();
        else return;
        event.preventDefault();
        applyTransform();
    });

    root.querySelector('[data-zoom-in]').addEventListener('click', () => zoom(.1));
    root.querySelector('[data-zoom-out]').addEventListener('click', () => zoom(-.1));
    root.querySelector('[data-recenter]').addEventListener('click', recenter);
    drawer.querySelector('[data-close-drawer]').addEventListener('click', closeDrawer);
    backdrop.addEventListener('click', closeDrawer);
    searchInput.addEventListener('input', updateSearch);
    searchResults.addEventListener('click', (event) => {
        const result = event.target.closest('[data-result]');
        if (!result) return;
        focusPerson(result.dataset.result);
        searchResults.hidden = true;
        searchInput.value = '';
    });
    document.addEventListener('click', (event) => {
        if (!event.target.closest('[data-search-form]')) searchResults.hidden = true;
    });
    const aboutDialog = document.querySelector('[data-about-dialog]');
    root.querySelector('[data-open-about]').addEventListener('click', () => aboutDialog.showModal());
    aboutDialog.querySelector('[data-close-about]').addEventListener('click', () => aboutDialog.close());
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && drawer.classList.contains('open')) closeDrawer();
    });
    window.addEventListener('resize', recenter);

    const initialiseTree = async () => {
        canvas.setAttribute('aria-busy', 'true');
        const layout = await layoutFamilyTree(Object.keys(people), parentage);
        renderLayout(layout);
        canvas.removeAttribute('aria-busy');
        loading.hidden = true;
        recenter();
    };

    initialiseTree().catch(() => {
        canvas.removeAttribute('aria-busy');
        loading.textContent = 'Impossible de construire l’arbre pour le moment.';
        loading.classList.add('is-error');
    });
}
