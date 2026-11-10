import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vite-plus/test';
import { emptyDesign, emptyResume } from '@/schema';
import type { ResumeContent } from '@/schema';
import * as ops from './operations';
import { createEditorStore, HISTORY_LIMIT, MERGE_WINDOW_MS } from './store';

const resume = () => emptyResume();
const summaryOf = (content: ResumeContent) =>
    (
        content.sections.find((s) => s.type === 'summary')!.items[0] as {
            text: string;
        }
    ).text;

function setup() {
    const content = resume();
    const store = createEditorStore({
        type: 'resume',
        template_key: 'classic',
        content,
        design: emptyDesign(),
    });
    const summary = content.sections.find((s) => s.type === 'summary')!;
    const type = (text: string) =>
        store.getState().change(
            {
                content: ops.setItemField(
                    store.getState().content as ResumeContent,
                    summary.id,
                    summary.items[0].id,
                    'text',
                    text,
                ),
            },
            `${summary.id}:text`,
        );

    return {
        store,
        type,
        content: () => store.getState().content as ResumeContent,
    };
}

describe('undo history', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('merges fast typing in one field into one step', () => {
        const { store, type, content } = setup();

        for (const text of ['H', 'He', 'Hel', 'Hell', 'Hello']) {
            type(text);
            vi.advanceTimersByTime(100);
        }

        expect(store.temporal.getState().pastStates).toHaveLength(1);
        store.temporal.getState().undo();
        expect(summaryOf(content())).toBe('');
    });

    it('starts a new step after a pause', () => {
        const { store, type, content } = setup();

        type('Hello');
        vi.advanceTimersByTime(MERGE_WINDOW_MS + 1);
        type('Hello world');

        expect(store.temporal.getState().pastStates).toHaveLength(2);
        store.temporal.getState().undo();
        expect(summaryOf(content())).toBe('Hello');
        store.temporal.getState().redo();
        expect(summaryOf(content())).toBe('Hello world');
    });

    it('keeps structural changes as separate steps', () => {
        const { store, content } = setup();
        const experience = content().sections.find(
            (s) => s.type === 'experience',
        )!;

        store
            .getState()
            .change({ content: ops.addItem(content(), experience.id)[0] });
        store
            .getState()
            .change({ content: ops.addItem(content(), experience.id)[0] });

        expect(store.temporal.getState().pastStates).toHaveLength(2);
        store.temporal.getState().undo();
        expect(
            content().sections.find((s) => s.id === experience.id)!.items,
        ).toHaveLength(2);
    });

    it(`keeps at most ${HISTORY_LIMIT} steps`, () => {
        const { store, type } = setup();

        for (let i = 0; i < HISTORY_LIMIT + 20; i++) {
            type(`v${i}`);
            vi.advanceTimersByTime(MERGE_WINDOW_MS + 1);
        }

        expect(store.temporal.getState().pastStates).toHaveLength(
            HISTORY_LIMIT,
        );
    });
});

describe('operations', () => {
    it('adds, duplicates, moves and removes items', () => {
        let content = resume();
        const experience = content.sections.find(
            (s) => s.type === 'experience',
        )!;
        const firstId = experience.items[0].id;

        let secondId: string;
        [content, secondId] = ops.addItem(content, experience.id);
        content = ops.setItemField(
            content,
            experience.id,
            secondId,
            'role',
            'Second',
        );
        content = ops.duplicateItem(content, experience.id, secondId);
        content = ops.moveItem(content, experience.id, 2, 0);

        const list = content.sections.find((s) => s.id === experience.id)!
            .items as { id: string; role: string }[];
        expect(list.map((i) => i.role)).toEqual(['Second', '', 'Second']);
        expect(new Set(list.map((i) => i.id)).size).toBe(3);

        content = ops.removeItem(content, experience.id, firstId);
        expect(
            content.sections.find((s) => s.id === experience.id)!.items,
        ).toHaveLength(2);
    });

    it('never removes the header or adds a second summary', () => {
        const content = resume();
        const header = content.sections[0];

        expect(ops.removeSection(content, header.id).sections[0]).toBe(header);
        expect(ops.addSection(content, 'summary', 'main')[0]).toBe(content);
        expect(ops.removeItem(content, header.id, header.items[0].id)).toEqual(
            content,
        );
    });

    it('moves sections within their column and never above the header', () => {
        let content = resume();
        const [, summary, experience] = content.sections;

        content = ops.shiftSection(content, summary.id, -1, false);
        expect(content.sections[1].id).toBe(summary.id);

        content = ops.updateSection(content, experience.id, { column: 'side' });
        content = ops.shiftSection(content, content.sections[3].id, -1, true);
        expect(content.sections.map((s) => s.type)).toEqual([
            'header',
            'education',
            'summary',
            'experience',
            'skills',
        ]);
    });

    it('merges section settings', () => {
        const content = resume();
        const experience = content.sections.find(
            (s) => s.type === 'experience',
        )!;
        const next = ops.updateSection(content, experience.id, {
            settings: { showLink: false },
        });

        expect(
            next.sections.find((s) => s.id === experience.id)!.settings,
        ).toMatchObject({
            showLink: false,
            showDates: true,
        });
    });
});
