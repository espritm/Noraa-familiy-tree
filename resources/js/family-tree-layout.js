export const PERSON_WIDTH = 260;
export const PERSON_HEIGHT = 104;

const FAMILY_NODE_SIZE = 2;

export function buildFamilyUnits(personIds, parentage) {
    const knownPeople = new Set(personIds);
    const parentsByChild = new Map();

    parentage.forEach(({ parent_id: parentId, child_id: childId }) => {
        if (!knownPeople.has(parentId) || !knownPeople.has(childId) || parentId === childId) return;
        if (!parentsByChild.has(childId)) parentsByChild.set(childId, new Set());
        parentsByChild.get(childId).add(parentId);
    });

    const unitsByParents = new Map();
    parentsByChild.forEach((parents, childId) => {
        const parentIds = Array.from(parents).sort();
        if (!parentIds.length) return;
        const key = JSON.stringify(parentIds);
        if (!unitsByParents.has(key)) {
            unitsByParents.set(key, {
                id: `family-${unitsByParents.size}`,
                parentIds,
                childIds: [],
            });
        }
        unitsByParents.get(key).childIds.push(childId);
    });

    return Array.from(unitsByParents.values());
}

export function buildLayoutGraph(personIds, parentage) {
    const familyUnits = buildFamilyUnits(personIds, parentage);
    const children = personIds.map((id) => ({
        id: `person:${id}`,
        width: PERSON_WIDTH,
        height: PERSON_HEIGHT,
        personId: id,
    }));
    const edges = [];
    const edgeKinds = new Map();
    const edgeFamilyIds = new Map();
    const edgeEndpoints = new Map();

    familyUnits.forEach((family, familyIndex) => {
        children.push({
            id: family.id,
            width: FAMILY_NODE_SIZE,
            height: FAMILY_NODE_SIZE,
            familyId: family.id,
        });

        family.parentIds.forEach((parentId, parentIndex) => {
            const id = `parent-edge-${familyIndex}-${parentIndex}`;
            edges.push({ id, sources: [`person:${parentId}`], targets: [family.id] });
            edgeKinds.set(id, 'union');
            edgeFamilyIds.set(id, family.id);
            edgeEndpoints.set(id, {
                source: { type: 'person', id: parentId },
                target: { type: 'family', id: family.id },
            });
        });

        family.childIds.forEach((childId, childIndex) => {
            const id = `child-edge-${familyIndex}-${childIndex}`;
            edges.push({ id, sources: [family.id], targets: [`person:${childId}`] });
            edgeKinds.set(id, 'parentage');
            edgeFamilyIds.set(id, family.id);
            edgeEndpoints.set(id, {
                source: { type: 'family', id: family.id },
                target: { type: 'person', id: childId },
            });
        });
    });

    return {
        graph: {
            id: 'family-tree',
            layoutOptions: {
                'elk.algorithm': 'layered',
                'elk.direction': 'DOWN',
                'elk.edgeRouting': 'ORTHOGONAL',
                'elk.padding': '[top=60,left=60,bottom=60,right=60]',
                'elk.spacing.componentComponent': '100',
                'elk.spacing.nodeNode': '48',
                'elk.layered.spacing.nodeNodeBetweenLayers': '92',
                'elk.layered.spacing.edgeNodeBetweenLayers': '36',
                'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
                'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
                'elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES',
                'elk.layered.unnecessaryBendpoints': 'true',
                'elk.separateConnectedComponents': 'true',
            },
            children,
            edges,
        },
        edgeKinds,
        edgeFamilyIds,
        edgeEndpoints,
        familyUnits,
    };
}

function sectionPoints(section) {
    return [section.startPoint, ...(section.bendPoints || []), section.endPoint]
        .filter(Boolean)
        .map(({ x, y }) => ({ x, y }));
}

export async function layoutFamilyTree(personIds, parentage, elkInstance = null) {
    const { graph, edgeKinds, edgeFamilyIds, edgeEndpoints, familyUnits } = buildLayoutGraph(personIds, parentage);
    let elk = elkInstance;

    if (!elk) {
        const { default: ELK } = await import('elkjs/lib/elk.bundled.js');
        elk = new ELK();
    }

    const result = await elk.layout(graph);
    const people = new Map();
    const families = new Map();

    (result.children || []).forEach((node) => {
        if (node.personId) {
            people.set(node.personId, {
                x: node.x || 0,
                y: node.y || 0,
                width: node.width || PERSON_WIDTH,
                height: node.height || PERSON_HEIGHT,
            });
        } else if (node.familyId) {
            families.set(node.familyId, {
                x: node.x || 0,
                y: node.y || 0,
                width: node.width || FAMILY_NODE_SIZE,
                height: node.height || FAMILY_NODE_SIZE,
            });
        }
    });

    const edges = (result.edges || []).flatMap((edge) => (edge.sections || []).map((section) => ({
        id: edge.id,
        kind: edgeKinds.get(edge.id) || 'parentage',
        familyId: edgeFamilyIds.get(edge.id),
        ...edgeEndpoints.get(edge.id),
        points: sectionPoints(section),
    })));

    return {
        width: Math.ceil(result.width || 1400),
        height: Math.ceil(result.height || 820),
        people,
        families,
        familyUnits,
        edges,
    };
}
