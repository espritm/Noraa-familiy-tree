import { layoutFamilyTree } from './family-tree-layout.js';

const root = document.querySelector('[data-research-map]');

if (root) {
    const dataElement = document.querySelector('[data-research-map-data]');
    const data = dataElement ? JSON.parse(dataElement.textContent) : null;

    if (data?.people?.length) {
        const stage = root.querySelector('[data-stage]');
        const canvas = root.querySelector('[data-canvas]');
        const connections = root.querySelector('[data-connections]');
        const loading = root.querySelector('[data-tree-loading]');
        const hint = root.querySelector('[data-drag-hint]');
        const searchInput = root.querySelector('[data-search]');
        const searchResults = root.querySelector('[data-search-results]');
        const drawer = document.querySelector('[data-drawer]');
        const backdrop = document.querySelector('[data-backdrop]');
        const people = new Map(data.people.map((person) => [person.id, person]));
        const zones = new Map(data.zones.map((zone) => [zone.id, zone]));
        const cards = new Map();
        const positions = new Map();
        const palette = ['gold', 'blue', 'rose', 'green', 'ink'];
        let canvasWidth = 1600;
        let canvasHeight = 1000;
        let scale = .5;
        let x = 0;
        let y = 0;
        let dragging = false;
        let startX = 0;
        let startY = 0;
        let originX = 0;
        let originY = 0;

        const formatDate = (value) => {
            if (!value) return 'Date inconnue';
            if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
            const date = new Date(`${value}T00:00:00`);
            return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(date);
        };

        const lifespan = (person) => {
            const birth = person.birth ? formatDate(person.birth) : 'Date inconnue';
            return person.death ? `${birth} — ${formatDate(person.death)}` : birth;
        };

        const initials = (name) => name.split(/[\s-]+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toLocaleUpperCase('fr') || '?';
        const applyTransform = () => { canvas.style.transform = `translate(${x}px, ${y}px) scale(${scale})`; };
        const recenter = () => {
            const horizontalScale = (stage.clientWidth - 80) / canvasWidth;
            const verticalScale = (stage.clientHeight - 80) / canvasHeight;
            scale = Math.min(.82, Math.max(.16, Math.min(horizontalScale, verticalScale)));
            x = stage.clientWidth / 2 - (canvasWidth / 2) * scale;
            y = stage.clientHeight / 2 - (canvasHeight / 2) * scale;
            applyTransform();
        };
        const zoom = (delta, centerX = stage.clientWidth / 2, centerY = stage.clientHeight / 2) => {
            const previous = scale;
            scale = Math.min(1.35, Math.max(.12, scale + delta));
            x = centerX - ((centerX - x) / previous) * scale;
            y = centerY - ((centerY - y) / previous) * scale;
            applyTransform();
        };

        const focusPeople = (ids) => {
            const existing = ids.map((id) => positions.get(id)).filter(Boolean);
            if (!existing.length) return;
            const centerX = existing.reduce((sum, position) => sum + position.x + position.width / 2, 0) / existing.length;
            const centerY = existing.reduce((sum, position) => sum + position.y + position.height / 2, 0) / existing.length;
            scale = Math.max(scale, .65);
            x = stage.clientWidth / 2 - centerX * scale;
            y = stage.clientHeight / 2 - centerY * scale;
            applyTransform();
            cards.forEach((card, id) => card.classList.toggle('is-family-highlighted', ids.includes(id)));
        };

        const openDrawer = (person) => {
            const zone = zones.get(person.zone);
            drawer.querySelector('[data-drawer-portrait]').textContent = initials(person.display_name);
            drawer.querySelector('[data-drawer-relation]').textContent = person.displayed_in_tree ? 'Présente dans l’arbre familial' : 'Personne issue des recherches';
            drawer.querySelector('[data-drawer-name]').textContent = person.display_name;
            drawer.querySelector('[data-drawer-lifespan]').textContent = lifespan(person);
            const facts = [
                ['Zone', zone?.title || 'Non classée'],
                ['Confiance', person.confidence === 'certain' || person.confidence === 'high' ? 'Établie' : person.confidence === 'low' ? 'Incertaine' : 'Probable'],
                ['Naissance', person.birth ? formatDate(person.birth) : 'Non renseignée'],
                ['Décès', person.death ? formatDate(person.death) : 'Non renseigné'],
            ];
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
            const sources = person.source_refs?.length ? person.source_refs.join(', ') : 'Aucune référence disponible';
            const variants = person.variants?.length ? ` Variantes : ${person.variants.join(', ')}.` : '';
            drawer.querySelector('[data-drawer-story]').textContent = `Sources : ${sources}.${variants}`;
            drawer.classList.add('open');
            drawer.setAttribute('aria-hidden', 'false');
            backdrop.hidden = false;
        };

        const closeDrawer = () => {
            drawer.classList.remove('open');
            drawer.setAttribute('aria-hidden', 'true');
            backdrop.hidden = true;
        };

        const createCard = (person, position, index) => {
            const card = document.createElement('article');
            const confidence = person.confidence === 'certain' || person.confidence === 'high' ? 'certain' : person.confidence === 'low' ? 'uncertain' : 'probable';
            card.className = `person-card research-person-card confidence-${confidence}`;
            card.style.setProperty('--x', `${position.x}px`);
            card.style.setProperty('--y', `${position.y}px`);
            card.dataset.person = person.id;
            card.tabIndex = 0;
            const portrait = document.createElement('div');
            portrait.className = `portrait portrait-${palette[index % palette.length]}`;
            portrait.textContent = initials(person.display_name);
            const details = document.createElement('div');
            const relationship = document.createElement('span');
            relationship.className = 'relationship';
            relationship.textContent = person.displayed_in_tree ? 'Dans l’arbre' : confidence === 'certain' ? 'Source établie' : confidence === 'probable' ? 'Piste probable' : 'À vérifier';
            const heading = document.createElement('h3');
            heading.textContent = person.display_name;
            const dates = document.createElement('p');
            dates.textContent = lifespan(person);
            details.append(relationship, heading, dates);
            card.append(portrait, details);
            card.addEventListener('click', () => openDrawer(person));
            card.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openDrawer(person);
                }
            });
            return card;
        };

        const pathFromPoints = (points) => points.reduce((path, point, index) => `${path}${index ? ' L' : 'M'} ${point.x} ${point.y}`, '');
        const svgPath = (d, className) => {
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', d);
            path.setAttribute('class', className);
            connections.appendChild(path);
        };

        const confidenceClassForEdge = (edge, familyUnits) => {
            const family = familyUnits.find((unit) => unit.id === edge.familyId);
            if (!family?.childIds?.length) return '';
            const relations = data.parentage.filter((relation) => family.parentIds.includes(relation.parent_id)
                && family.childIds.includes(relation.child_id));
            if (relations.some((relation) => relation.confidence === 'uncertain')) return ' uncertain';
            if (relations.some((relation) => relation.confidence === 'probable')) return ' probable';
            return '';
        };

        const initialise = async () => {
            canvas.setAttribute('aria-busy', 'true');
            const zoneLayouts = [];
            for (const [index, zone] of data.zones.entries()) {
                const ids = data.people.filter((person) => person.zone === zone.id).map((person) => person.id);
                const idSet = new Set(ids);
                const parentage = data.parentage.filter((relation) => idSet.has(relation.parent_id) && idSet.has(relation.child_id));
                const couples = data.couples.filter((relation) => relation.people.every((id) => idSet.has(id)));
                const layout = await layoutFamilyTree(ids, parentage, null, couples);
                zoneLayouts.push({ zone, layout, index });
            }

            const gap = 220;
            const margin = 80;
            const labelHeight = 110;
            const first = zoneLayouts[0];
            const second = zoneLayouts[1];
            const third = zoneLayouts[2];
            const placements = new Map([
                [first.zone.id, { x: margin, y: margin }],
                [second.zone.id, { x: margin + first.layout.width + gap, y: margin }],
                [third.zone.id, { x: margin, y: margin + Math.max(first.layout.height, second.layout.height) + labelHeight + gap }],
            ]);
            canvasWidth = Math.max(
                first.layout.width + second.layout.width + gap + margin * 2,
                third.layout.width + margin * 2,
            );
            canvasHeight = margin * 2 + Math.max(first.layout.height, second.layout.height) + third.layout.height + labelHeight * 2 + gap;
            canvas.style.width = `${canvasWidth}px`;
            canvas.style.height = `${canvasHeight}px`;
            connections.style.width = `${canvasWidth}px`;
            connections.style.height = `${canvasHeight}px`;
            connections.setAttribute('viewBox', `0 0 ${canvasWidth} ${canvasHeight}`);
            connections.replaceChildren();

            zoneLayouts.forEach(({ zone, layout }) => {
                const placement = placements.get(zone.id);
                const island = document.createElement('section');
                island.className = `research-island island-${zone.tone}`;
                island.style.left = `${placement.x - 30}px`;
                island.style.top = `${placement.y - 20}px`;
                island.style.width = `${layout.width + 60}px`;
                island.style.height = `${layout.height + labelHeight + 50}px`;
                const title = document.createElement('h3');
                title.textContent = `${zone.title} · ${zone.people_count} personnes`;
                const description = document.createElement('p');
                description.textContent = zone.description;
                island.append(title, description);
                canvas.appendChild(island);

                layout.families.forEach((family) => {
                    const junction = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                    junction.setAttribute('class', 'family-junction');
                    junction.setAttribute('cx', String(placement.x + family.x + family.width / 2));
                    junction.setAttribute('cy', String(placement.y + labelHeight + family.y + family.height / 2));
                    junction.setAttribute('r', '4');
                    connections.appendChild(junction);
                });
                layout.edges.forEach((edge) => {
                    const points = edge.points.map((point) => ({ x: point.x + placement.x, y: point.y + placement.y + labelHeight }));
                    const confidence = confidenceClassForEdge(edge, layout.familyUnits);
                    svgPath(pathFromPoints(points), `${edge.kind}${confidence}`);
                });
                layout.people.forEach((position, id) => positions.set(id, {
                    x: position.x + placement.x,
                    y: position.y + placement.y + labelHeight,
                    width: position.width,
                    height: position.height,
                }));
            });

            data.parentage.filter((relation) => people.get(relation.parent_id)?.zone !== people.get(relation.child_id)?.zone).forEach((relation) => {
                const parent = positions.get(relation.parent_id);
                const child = positions.get(relation.child_id);
                if (!parent || !child) return;
                const start = { x: parent.x + parent.width / 2, y: parent.y + parent.height };
                const end = { x: child.x + child.width / 2, y: child.y };
                const middleX = (start.x + end.x) / 2;
                svgPath(`M ${start.x} ${start.y} C ${middleX} ${start.y + 80}, ${middleX} ${end.y - 80}, ${end.x} ${end.y}`, 'research-bridge confirmed');
            });

            data.people.forEach((person, index) => {
                const position = positions.get(person.id);
                if (!position) return;
                const card = createCard(person, position, index);
                cards.set(person.id, card);
                canvas.appendChild(card);
            });
            canvas.removeAttribute('aria-busy');
            loading.hidden = true;
            recenter();
        };

        const updateSearch = () => {
            const query = searchInput.value.trim().toLocaleLowerCase('fr');
            if (!query) { searchResults.hidden = true; return; }
            const matches = data.people.filter((person) => person.display_name.toLocaleLowerCase('fr').includes(query)).slice(0, 12);
            searchResults.replaceChildren(...(matches.length ? matches.map((person) => {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'search-result';
                button.dataset.result = person.id;
                button.textContent = `${person.display_name} — ${zones.get(person.zone)?.title || ''}`;
                return button;
            }) : [Object.assign(document.createElement('p'), { className: 'search-result', textContent: 'Aucun résultat' })]));
            searchResults.hidden = false;
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
            zoom(event.deltaY > 0 ? -.07 : .07, event.clientX - rect.left, event.clientY - rect.top);
        }, { passive: false });
        root.querySelector('[data-zoom-in]').addEventListener('click', () => zoom(.1));
        root.querySelector('[data-zoom-out]').addEventListener('click', () => zoom(-.1));
        root.querySelector('[data-recenter]').addEventListener('click', recenter);
        searchInput.addEventListener('input', updateSearch);
        searchResults.addEventListener('click', (event) => {
            const result = event.target.closest('[data-result]');
            if (!result) return;
            focusPeople([result.dataset.result]); searchResults.hidden = true; searchInput.value = '';
        });
        document.querySelectorAll('[data-focus-people]').forEach((button) => button.addEventListener('click', () => focusPeople(button.dataset.focusPeople.split(',').filter(Boolean))));
        drawer.querySelector('[data-close-drawer]').addEventListener('click', closeDrawer);
        backdrop.addEventListener('click', closeDrawer);
        const aboutDialog = document.querySelector('[data-about-dialog]');
        root.querySelector('[data-open-about]').addEventListener('click', () => aboutDialog.showModal());
        aboutDialog.querySelector('[data-close-about]').addEventListener('click', () => aboutDialog.close());
        window.addEventListener('resize', recenter);

        initialise().catch(() => {
            canvas.removeAttribute('aria-busy');
            loading.textContent = 'Impossible de construire la carte pour le moment.';
            loading.classList.add('is-error');
        });
    }
}
