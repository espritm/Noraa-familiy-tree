const people = {
    jeanne: { name: 'Jeanne Morel', relation: 'Point de départ', lifespan: '1948 — aujourd’hui', initials: 'JM', birth: '14 mai 1948', place: 'Tours, France', occupation: 'Institutrice', source: 'Données fictives', story: 'Jeanne a grandi près de la Loire. Passionnée par les récits transmis lors des réunions de famille, elle a conservé lettres, photographies et souvenirs pour les générations suivantes.' },
    lucien: { name: 'Lucien Morel', relation: 'Grand-père', lifespan: '1919 — 1998', initials: 'LM', birth: '2 mars 1919', place: 'Blois, France', occupation: 'Menuisier', source: 'Données fictives', story: 'Lucien travaillait le bois et notait dans de petits carnets les événements importants de la famille.' },
    madeleine: { name: 'Madeleine Dubois', relation: 'Grand-mère', lifespan: '1922 — 2007', initials: 'MD', birth: '9 octobre 1922', place: 'Amboise, France', occupation: 'Couturière', source: 'Données fictives', story: 'Madeleine était reconnue pour sa mémoire des visages et des liens qui unissaient les différentes branches familiales.' },
    antoine: { name: 'Antoine Bernard', relation: 'Époux', lifespan: '1946 — 2021', initials: 'AB', birth: '18 janvier 1946', place: 'Saumur, France', occupation: 'Libraire', source: 'Données fictives', story: 'Antoine aimait collectionner les cartes postales anciennes et raconter l’histoire des villages traversés pendant son enfance.' },
    claire: { name: 'Claire Bernard', relation: 'Fille', lifespan: 'née en 1973', initials: 'CB', birth: '6 juin 1973', place: 'Tours, France', occupation: 'Architecte', source: 'Données fictives', story: 'Claire rassemble les photographies familiales et documente les lieux qui ont marqué chaque génération.' },
    julien: { name: 'Julien Bernard', relation: 'Fils', lifespan: 'né en 1977', initials: 'JB', birth: '21 août 1977', place: 'Tours, France', occupation: 'Photographe', source: 'Données fictives', story: 'Julien photographie les maisons et paysages évoqués dans les archives familiales.' },
    auguste: { name: 'Auguste Morel', relation: 'Arrière-grand-père', lifespan: '1887 — 1958', initials: 'AM', birth: '3 avril 1887', place: 'Vendôme, France', occupation: 'Vigneron', source: 'Données fictives', story: 'Auguste cultivait une petite parcelle et conservait soigneusement les actes et correspondances reçus par la famille.' },
    celestine: { name: 'Célestine Petit', relation: 'Arrière-grand-mère', lifespan: '1892 — 1966', initials: 'CP', birth: '27 novembre 1892', place: 'Chinon, France', occupation: 'Épicière', source: 'Données fictives', story: 'Célestine tenait une épicerie où les nouvelles du voisinage et les histoires familiales circulaient chaque jour.' },
};

const root = document.querySelector('[data-family-tree]');

if (root) {
    const stage = root.querySelector('[data-stage]');
    const canvas = root.querySelector('[data-canvas]');
    const connections = root.querySelector('[data-connections]');
    const drawer = document.querySelector('[data-drawer]');
    const backdrop = document.querySelector('[data-backdrop]');
    const hint = root.querySelector('[data-drag-hint]');
    const searchInput = root.querySelector('[data-search]');
    const searchResults = root.querySelector('[data-search-results]');
    let scale = 0.88;
    let x = 0;
    let y = 0;
    let dragging = false;
    let startX = 0;
    let startY = 0;
    let originX = 0;
    let originY = 0;
    let lastFocused = null;

    const drawPath = (from, to, className = '') => {
        const start = document.querySelector(`[data-person="${from}"]`);
        const end = document.querySelector(`[data-person="${to}"]`);
        const sx = parseFloat(start.style.getPropertyValue('--x')) + 130;
        const sy = parseFloat(start.style.getPropertyValue('--y')) + 94;
        const ex = parseFloat(end.style.getPropertyValue('--x')) + 130;
        const ey = parseFloat(end.style.getPropertyValue('--y'));
        const middle = sy + (ey - sy) / 2;
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', `M ${sx} ${sy} C ${sx} ${middle}, ${ex} ${middle}, ${ex} ${ey}`);
        if (className) path.setAttribute('class', className);
        connections.appendChild(path);
    };

    drawPath('auguste', 'lucien');
    drawPath('celestine', 'madeleine');
    drawPath('lucien', 'jeanne');
    drawPath('madeleine', 'jeanne');
    drawPath('jeanne', 'claire');
    drawPath('antoine', 'claire');
    drawPath('jeanne', 'julien');
    drawPath('antoine', 'julien');

    const union = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    union.setAttribute('class', 'union');
    union.setAttribute('d', 'M 850 382 C 875 370, 900 370, 915 382');
    connections.appendChild(union);

    const applyTransform = () => { canvas.style.transform = `translate(${x}px, ${y}px) scale(${scale})`; };
    const recenter = () => {
        scale = window.innerWidth < 780 ? 0.7 : 0.88;
        x = stage.clientWidth / 2 - 720 * scale;
        y = stage.clientHeight / 2 - 390 * scale;
        applyTransform();
    };
    const zoom = (delta, centerX = stage.clientWidth / 2, centerY = stage.clientHeight / 2) => {
        const previous = scale;
        scale = Math.min(1.4, Math.max(0.48, scale + delta));
        x = centerX - ((centerX - x) / previous) * scale;
        y = centerY - ((centerY - y) / previous) * scale;
        applyTransform();
    };
    const focusPerson = (id) => {
        const card = root.querySelector(`[data-person="${id}"]`);
        const px = parseFloat(card.style.getPropertyValue('--x')) + 130;
        const py = parseFloat(card.style.getPropertyValue('--y')) + 47;
        x = stage.clientWidth / 2 - px * scale;
        y = stage.clientHeight / 2 - py * scale;
        applyTransform();
        card.classList.remove('is-highlighted');
        requestAnimationFrame(() => card.classList.add('is-highlighted'));
    };

    stage.addEventListener('pointerdown', (event) => {
        if (event.target.closest('.person-card')) return;
        dragging = true; startX = event.clientX; startY = event.clientY; originX = x; originY = y;
        stage.classList.add('is-dragging'); stage.setPointerCapture(event.pointerId); hint.classList.add('hidden');
    });
    stage.addEventListener('pointermove', (event) => {
        if (!dragging) return;
        x = originX + event.clientX - startX; y = originY + event.clientY - startY; applyTransform();
    });
    stage.addEventListener('pointerup', () => { dragging = false; stage.classList.remove('is-dragging'); });
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
        event.preventDefault(); applyTransform();
    });

    root.querySelector('[data-zoom-in]').addEventListener('click', () => zoom(.1));
    root.querySelector('[data-zoom-out]').addEventListener('click', () => zoom(-.1));
    root.querySelector('[data-recenter]').addEventListener('click', recenter);

    const openDrawer = (id, trigger) => {
        const person = people[id];
        if (!person) return;
        lastFocused = trigger;
        drawer.querySelector('[data-drawer-portrait]').textContent = person.initials;
        drawer.querySelector('[data-drawer-relation]').textContent = person.relation;
        drawer.querySelector('[data-drawer-name]').textContent = person.name;
        drawer.querySelector('[data-drawer-lifespan]').textContent = person.lifespan;
        drawer.querySelector('[data-drawer-story]').textContent = person.story;
        drawer.querySelector('[data-drawer-facts]').innerHTML = [
            ['Naissance', person.birth], ['Lieu', person.place], ['Profession', person.occupation], ['Source', person.source],
        ].map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join('');
        drawer.classList.add('open'); drawer.setAttribute('aria-hidden', 'false'); backdrop.hidden = false;
        drawer.querySelector('[data-close-drawer]').focus();
    };
    const closeDrawer = () => {
        drawer.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true'); backdrop.hidden = true;
        if (lastFocused) lastFocused.focus();
    };
    root.querySelectorAll('[data-person]').forEach((card) => {
        card.addEventListener('click', () => openDrawer(card.dataset.person, card));
        card.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openDrawer(card.dataset.person, card); }
        });
    });
    drawer.querySelector('[data-close-drawer]').addEventListener('click', closeDrawer);
    backdrop.addEventListener('click', closeDrawer);

    const updateSearch = () => {
        const query = searchInput.value.trim().toLocaleLowerCase('fr');
        if (!query) { searchResults.hidden = true; return; }
        const matches = Object.entries(people).filter(([, person]) => person.name.toLocaleLowerCase('fr').includes(query));
        searchResults.innerHTML = matches.length
            ? matches.map(([id, person]) => `<button class="search-result" type="button" data-result="${id}"><strong>${person.name}</strong><br><small>${person.lifespan}</small></button>`).join('')
            : '<p class="search-result">Aucun résultat</p>';
        searchResults.hidden = false;
    };
    searchInput.addEventListener('input', updateSearch);
    searchResults.addEventListener('click', (event) => {
        const result = event.target.closest('[data-result]');
        if (!result) return;
        focusPerson(result.dataset.result); searchResults.hidden = true; searchInput.value = '';
    });
    document.addEventListener('click', (event) => {
        if (!event.target.closest('[data-search-form]')) searchResults.hidden = true;
    });

    const aboutDialog = document.querySelector('[data-about-dialog]');
    root.querySelector('[data-open-about]').addEventListener('click', () => aboutDialog.showModal());
    aboutDialog.querySelector('[data-close-about]').addEventListener('click', () => aboutDialog.close());
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && drawer.classList.contains('open')) closeDrawer(); });
    window.addEventListener('resize', recenter);
    recenter();
}
