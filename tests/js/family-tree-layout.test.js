import { describe, expect, it } from 'vitest';
import { buildFamilyUnits, layoutFamilyTree } from '../../resources/js/family-tree-layout.js';

const people = [
    'ancestor-a', 'ancestor-b', 'ancestor-c', 'ancestor-d',
    'parent-a', 'parent-b', 'sibling-a', 'sibling-b', 'partner-x',
    'child-a', 'child-b', 'child-c', 'child-d', 'child-e', 'grandchild',
];

const parentage = [
    ['ancestor-a', 'parent-a'], ['ancestor-b', 'parent-a'],
    ['ancestor-c', 'parent-b'], ['ancestor-d', 'parent-b'],
    ['parent-a', 'sibling-a'], ['parent-b', 'sibling-a'],
    ['parent-a', 'sibling-b'], ['parent-b', 'sibling-b'],
    ['sibling-a', 'child-a'], ['partner-x', 'child-a'],
    ['sibling-a', 'child-b'], ['partner-x', 'child-b'],
    ['sibling-b', 'child-c'], ['sibling-b', 'child-d'], ['sibling-b', 'child-e'],
    ['child-d', 'grandchild'],
].map(([parent_id, child_id]) => ({ parent_id, child_id }));

const yOf = (layout, id) => layout.people.get(id).y;
const touchesBoundary = (point, box) => {
    const tolerance = 0.01;
    const onVerticalEdge = (Math.abs(point.x - box.x) < tolerance || Math.abs(point.x - (box.x + box.width)) < tolerance)
        && point.y >= box.y - tolerance && point.y <= box.y + box.height + tolerance;
    const onHorizontalEdge = (Math.abs(point.y - box.y) < tolerance || Math.abs(point.y - (box.y + box.height)) < tolerance)
        && point.x >= box.x - tolerance && point.x <= box.x + box.width + tolerance;
    return onVerticalEdge || onHorizontalEdge;
};

describe('family tree layout', () => {
    it('groups siblings into one family unit', () => {
        const units = buildFamilyUnits(people, parentage);
        const siblingUnit = units.find((unit) => unit.parentIds.includes('parent-a'));

        expect(siblingUnit.parentIds).toEqual(['parent-a', 'parent-b']);
        expect(siblingUnit.childIds).toEqual(['sibling-a', 'sibling-b']);
    });

    it('aligns co-parents and siblings while preserving generation order', async () => {
        const layout = await layoutFamilyTree(people, parentage);

        expect(layout.people.size).toBe(people.length);
        expect(yOf(layout, 'sibling-a')).toBeCloseTo(yOf(layout, 'sibling-b'));
        expect(yOf(layout, 'sibling-a')).toBeCloseTo(yOf(layout, 'partner-x'));
        expect(yOf(layout, 'child-a')).toBeCloseTo(yOf(layout, 'child-b'));
        expect(yOf(layout, 'child-c')).toBeCloseTo(yOf(layout, 'child-d'));
        expect(yOf(layout, 'child-d')).toBeLessThan(yOf(layout, 'grandchild'));
        expect(yOf(layout, 'parent-a')).toBeLessThan(yOf(layout, 'sibling-a'));
        expect(yOf(layout, 'sibling-a')).toBeLessThan(yOf(layout, 'child-a'));
    });

    it('keeps cards separate and every connection inside the canvas', async () => {
        const layout = await layoutFamilyTree(people, parentage);
        const boxes = Array.from(layout.people.values());

        boxes.forEach((left, leftIndex) => boxes.slice(leftIndex + 1).forEach((right) => {
            const overlaps = left.x < right.x + right.width
                && left.x + left.width > right.x
                && left.y < right.y + right.height
                && left.y + left.height > right.y;
            expect(overlaps).toBe(false);
        }));

        expect(layout.edges.length).toBeGreaterThan(0);
        layout.edges.forEach((edge) => {
            const source = edge.source.type === 'person' ? layout.people.get(edge.source.id) : layout.families.get(edge.source.id);
            const target = edge.target.type === 'person' ? layout.people.get(edge.target.id) : layout.families.get(edge.target.id);
            expect(touchesBoundary(edge.points[0], source)).toBe(true);
            expect(touchesBoundary(edge.points.at(-1), target)).toBe(true);

            edge.points.forEach((point) => {
                expect(point.x).toBeGreaterThanOrEqual(0);
                expect(point.y).toBeGreaterThanOrEqual(0);
                expect(point.x).toBeLessThanOrEqual(layout.width);
                expect(point.y).toBeLessThanOrEqual(layout.height);
            });
        });
    });
});
