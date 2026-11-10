import { describe, expect, it } from 'vite-plus/test';
import { emptyResume, emptySection } from '@/schema';
import type { ResumeContent } from '@/schema';
import { applyBoard, boardFromPlan } from './board';

function resume(): ResumeContent {
    const content = emptyResume();
    content.sections.push(emptySection('languages', 'side'));
    return content;
}

const ids = (content: ResumeContent) => content.sections.map((s) => s.type);

describe('boardFromPlan', () => {
    it('places each section on the page where it starts, plus an empty page', () => {
        const content = resume();
        const [, summary, experience, education, skills, languages] =
            content.sections;
        const plan = [
            {
                main: [
                    `${summary.id}|keep`,
                    `${experience.id}|keep`,
                    `${experience.id}|x`,
                ],
                side: [`${languages.id}|keep`],
            },
            {
                main: [
                    `${experience.id}|y`,
                    `${education.id}|keep`,
                    `${skills.id}|keep`,
                ],
                side: [],
            },
        ];

        expect(boardFromPlan(content, plan, true)).toEqual([
            { main: [summary.id, experience.id], side: [languages.id] },
            { main: [education.id, skills.id], side: [] },
            { main: [], side: [] },
        ]);
    });

    it('keeps sections missing from the plan at the end of their column', () => {
        const content = resume();
        const board = boardFromPlan(content, [], false);

        expect(board).toHaveLength(2);
        expect(board[0].main).toHaveLength(5);
    });
});

describe('applyBoard', () => {
    it('reorders sections and moves them between columns', () => {
        const content = resume();
        const [, summary, experience, education, skills, languages] =
            content.sections;
        const board = [
            {
                main: [experience.id, summary.id],
                side: [skills.id, languages.id],
            },
            { main: [education.id], side: [] },
        ];

        const next = applyBoard(content, board, true, null);

        expect(ids(next)).toEqual([
            'header',
            'experience',
            'summary',
            'skills',
            'languages',
            'education',
        ]);
        expect(next.sections.find((s) => s.id === skills.id)!.column).toBe(
            'side',
        );
    });

    it('adds a page break when a section is dropped at the top of a later page', () => {
        const content = resume();
        const [, summary, experience, education, skills] = content.sections;
        const board = [
            { main: [summary.id, experience.id, skills.id], side: [] },
            { main: [education.id], side: [] },
        ];

        const next = applyBoard(content, board, false, {
            id: education.id,
            page: 1,
            index: 0,
        });
        expect(
            next.sections.find((s) => s.id === education.id)!.pageBreakBefore,
        ).toBe(true);

        const back = applyBoard(
            next,
            [
                {
                    main: [summary.id, education.id, experience.id, skills.id],
                    side: [],
                },
            ],
            false,
            {
                id: education.id,
                page: 0,
                index: 1,
            },
        );
        expect(
            back.sections.find((s) => s.id === education.id)!.pageBreakBefore,
        ).toBe(false);
    });

    it('keeps the header first and leaves unlisted sections at the end', () => {
        const content = resume();
        const [, summary] = content.sections;
        const next = applyBoard(
            content,
            [{ main: [summary.id], side: [] }],
            false,
            null,
        );

        expect(next.sections[0].type).toBe('header');
        expect(next.sections).toHaveLength(content.sections.length);
    });
});
