// @vitest-environment jsdom
import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import { Editable } from './Editable';
import { KeywordsEditable } from './KeywordsEditable';

afterEach(cleanup);

const textbox = (container: HTMLElement) =>
    container.querySelector<HTMLElement>('[role=textbox]')!;

function type(element: HTMLElement, text: string) {
    element.textContent = text;
    fireEvent.input(element);
}

describe('Editable', () => {
    it('reports typed text and enforces the max length', () => {
        const onChange = vi.fn();
        const { container } = render(
            <Editable
                value=""
                onChange={onChange}
                label="Name"
                maxLength={5}
            />,
        );

        type(textbox(container), 'Grace Hopper');

        expect(onChange).toHaveBeenLastCalledWith('Grace');
        expect(textbox(container).textContent).toBe('Grace');
    });

    it('follows value changes from outside (undo)', () => {
        const { container, rerender } = render(
            <Editable value="Hello" onChange={() => {}} label="Name" />,
        );
        expect(textbox(container).textContent).toBe('Hello');

        rerender(<Editable value="Hi" onChange={() => {}} label="Name" />);
        expect(textbox(container).textContent).toBe('Hi');
    });

    it('does not rewrite the text when the value matches what was typed', () => {
        const { container, rerender } = render(
            <Editable value="" onChange={() => {}} label="Name" />,
        );
        const element = textbox(container);
        const node = document.createTextNode('Typed');
        element.replaceChildren(node);

        rerender(<Editable value="Typed" onChange={() => {}} label="Name" />);
        expect(element.firstChild).toBe(node);
    });
});

describe('KeywordsEditable', () => {
    it('parses comma separated keywords and keeps a trailing comma while typing', () => {
        const onChange = vi.fn();
        const { container, rerender } = render(
            <KeywordsEditable
                value={[]}
                onChange={onChange}
                label="Keywords"
            />,
        );
        const element = textbox(container);

        type(element, 'Go, Rust,');
        expect(onChange).toHaveBeenLastCalledWith(['Go', 'Rust']);

        rerender(
            <KeywordsEditable
                value={['Go', 'Rust']}
                onChange={onChange}
                label="Keywords"
            />,
        );
        expect(element.textContent).toBe('Go, Rust,');

        rerender(
            <KeywordsEditable
                value={['Go']}
                onChange={onChange}
                label="Keywords"
            />,
        );
        expect(element.textContent).toBe('Go');
    });
});
