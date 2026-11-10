import { Globe, Mail, MapPin, Phone } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import { Fragment } from 'react';
import { cn } from '@/lib/utils';
import type {
    HeaderItem,
    LanguageProficiency,
    PartialDate,
    Section,
} from '@/schema';
import { fieldDef } from '@/sections/fields';
import { SECTION_ICONS } from '@/sections/icons';
import { useItem, useRender } from './context';
import { maxLengthOf, useEdit } from './edit';
import {
    displayUrl,
    formatPartialDate,
    formatRange,
    isBlank,
    normalizeUrl,
} from './format';

type AnyRecord = Record<string, unknown>;

/** Whether a field of the current item should render at all. */
export function useFieldVisible(name: string): boolean {
    const { mode } = useRender();
    const { section, item } = useItem();
    const def = fieldDef(section.type, name);
    const settings = section.settings as AnyRecord;

    if (def?.toggle && settings[def.toggle] === false) {
        return false;
    }

    return mode === 'edit' || !isBlank((item as AnyRecord)[name]);
}

/**
 * One field of the current item: plain text, a link or rich text depending
 * on its kind. Empty fields render nothing outside the editor.
 */
export function Field({
    name,
    className,
}: {
    name: string;
    className?: string;
}) {
    const { mode } = useRender();
    const edit = useEdit();
    const { section, item } = useItem();
    const visible = useFieldVisible(name);
    const def = fieldDef(section.type, name);
    const raw = (item as AnyRecord)[name];
    const text = typeof raw === 'string' ? raw : '';

    if (!visible) {
        return null;
    }

    if (mode === 'edit' && edit) {
        const onChange = (value: string) =>
            edit.setField(
                section.id,
                item.id,
                name,
                def?.kind === 'url' ? value.replace(/\s/g, '') : value,
            );
        const label = def?.label ?? name;

        return def?.kind === 'rich' ? (
            <edit.Rich
                html={text}
                onChange={onChange}
                placeholder={def.placeholder}
                label={label}
                className={className}
            />
        ) : (
            <edit.Text
                value={text}
                onChange={onChange}
                placeholder={def?.placeholder}
                label={label}
                maxLength={maxLengthOf(section.type, name)}
                className={className}
                field={name}
                spellCheck={
                    !['email', 'phone', 'url'].includes(def?.kind ?? '') &&
                    !(section.type === 'header' && name === 'name')
                }
            />
        );
    }

    if (def?.kind === 'rich') {
        return (
            <RichText
                html={text}
                placeholder={def.placeholder}
                className={className}
            />
        );
    }

    if (text === '') {
        return (
            <span className={cn('cv-placeholder', className)} data-field={name}>
                {def?.placeholder ?? ''}
            </span>
        );
    }

    if ((def?.kind === 'url' || def?.kind === 'email') && mode !== 'edit') {
        const href =
            def.kind === 'email' ? `mailto:${text}` : normalizeUrl(text);

        return (
            <a
                href={href}
                className={cn('cv-link', className)}
                data-field={name}
            >
                {def.kind === 'url' ? displayUrl(text) : text}
            </a>
        );
    }

    return (
        <span className={className} data-field={name}>
            {text}
        </span>
    );
}

/** Sanitized HTML (the server cleans every rich text field on save). */
export function RichText({
    html,
    placeholder,
    className,
}: {
    html: string;
    placeholder?: string;
    className?: string;
}) {
    const { mode } = useRender();

    if (isBlank(html)) {
        return mode === 'edit' ? (
            <div className={cn('cv-rich cv-placeholder', className)}>
                {placeholder}
            </div>
        ) : null;
    }

    return (
        <div
            className={cn('cv-rich', className)}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}

/** Visible fields joined by separators: "London · company.com". */
export function Meta({
    names,
    className,
    fieldClassNames = {},
}: {
    names: string[];
    className?: string;
    fieldClassNames?: Record<string, string>;
}) {
    const { mode } = useRender();
    const { section, item } = useItem();
    const settings = section.settings as AnyRecord;
    const visible = names.filter((name) => {
        const def = fieldDef(section.type, name);

        if (def?.toggle && settings[def.toggle] === false) {
            return false;
        }

        return mode === 'edit' || !isBlank((item as AnyRecord)[name]);
    });

    if (visible.length === 0) {
        return null;
    }

    return (
        <div className={className}>
            {visible.map((name, i) => (
                <Fragment key={name}>
                    {i > 0 && <span className="cv-sep" aria-hidden />}
                    <Field name={name} className={fieldClassNames[name]} />
                </Fragment>
            ))}
        </div>
    );
}

/** The item's date or date range in the document's date format. */
export function Dates({ className }: { className?: string }) {
    const { design, mode } = useRender();
    const edit = useEdit();
    const { section, item } = useItem();
    const record = item as AnyRecord;
    const ranged = 'start' in record;
    const def = fieldDef(section.type, ranged ? 'start' : 'date');
    const settings = section.settings as AnyRecord;

    if (!def || (def.toggle && settings[def.toggle] === false)) {
        return null;
    }

    if (mode === 'edit' && edit) {
        return <edit.Dates className={className} />;
    }

    const text = ranged
        ? formatRange(
              record.start as PartialDate,
              record.end as PartialDate,
              record.current === true,
              design.dateFormat,
          )
        : formatPartialDate(record.date as PartialDate, design.dateFormat);

    if (text === '') {
        return mode === 'edit' ? (
            <span className={cn('cv-dates cv-placeholder', className)}>
                Dates
            </span>
        ) : null;
    }

    return <span className={cn('cv-dates', className)}>{text}</span>;
}

export function SectionTitle({ section }: { section: Section }) {
    const { design, mode } = useRender();
    const edit = useEdit();
    const Icon = SECTION_ICONS[section.type];

    return (
        <h2 className="cv-section-title">
            {design.sectionTitle.icons && (
                <Icon className="cv-section-icon" aria-hidden />
            )}
            {mode === 'edit' && edit ? (
                <edit.Text
                    value={section.title}
                    onChange={(title) =>
                        edit.setSectionTitle(section.id, title)
                    }
                    placeholder="Section title"
                    label="Section title"
                    maxLength={80}
                />
            ) : (
                <span>{section.title}</span>
            )}
        </h2>
    );
}

interface EntryProps {
    title: string;
    subtitle?: string;
    meta?: string[];
    body?: string;
}

/**
 * The shared entry layout, in the variant the template picks:
 *
 *   stacked   Title ................ Dates      inline   Title, Subtitle ...... Dates
 *             Subtitle · meta                           meta
 *
 *   timeline  Dates
 *             Title
 *             Subtitle · meta
 */
export function Entry({ title, subtitle, meta = [], body }: EntryProps) {
    const { template } = useRender();
    const layout = template.entryLayout;
    const subtitleClass = subtitle ? { [subtitle]: 'cv-entry-subtitle' } : {};
    const sub =
        layout === 'inline' ? meta : [...(subtitle ? [subtitle] : []), ...meta];

    return (
        <div className="cv-entry" data-layout={layout}>
            {layout === 'timeline' && <Dates className="cv-entry-dates" />}
            <div className="cv-entry-head">
                {layout === 'inline' && subtitle ? (
                    <Meta
                        names={[title, subtitle]}
                        className="cv-entry-titles"
                        fieldClassNames={{
                            [title]: 'cv-entry-title',
                            ...subtitleClass,
                        }}
                    />
                ) : (
                    <Field name={title} className="cv-entry-title" />
                )}
                {layout !== 'timeline' && <Dates className="cv-entry-dates" />}
            </div>
            <Meta
                names={sub}
                className="cv-entry-meta"
                fieldClassNames={subtitleClass}
            />
            {body && <Field name={body} className="cv-entry-body" />}
        </div>
    );
}

// ---------------------------------------------------------------- header

export function useHeader(): {
    item: HeaderItem;
    settings: Extract<Section, { type: 'header' }>['settings'];
} {
    const { section, item } = useItem();

    return {
        item: item as HeaderItem,
        settings: (section as Extract<Section, { type: 'header' }>).settings,
    };
}

const CONTACT_ICONS = {
    email: Mail,
    phone: Phone,
    location: MapPin,
    link: Globe,
};

/** Email, phone, location and links as a list. Templates choose separators or icons. */
export function ContactList({
    icons = false,
    only,
    className,
}: {
    icons?: boolean;
    /** Just the contact details or just the links. */
    only?: 'details' | 'links';
    className?: string;
}) {
    const { mode } = useRender();
    const { item, settings } = useHeader();
    const entries: {
        key: string;
        kind: keyof typeof CONTACT_ICONS;
        node: ReactNode;
    }[] = [];

    const details = ['email', 'phone', 'location'] as const;

    for (const name of only === 'links' ? [] : details) {
        if (name === 'location' && !settings.showLocation) {
            continue;
        }
        if (mode === 'edit' || item[name] !== '') {
            entries.push({
                key: name,
                kind: name,
                node: <Field name={name} />,
            });
        }
    }

    if (settings.showLinks && only !== 'details') {
        for (const link of item.links) {
            const label = link.label || displayUrl(link.url);
            entries.push({
                key: link.id,
                kind: 'link',
                node:
                    mode === 'edit' || link.url === '' ? (
                        <span>{label}</span>
                    ) : (
                        <a className="cv-link" href={normalizeUrl(link.url)}>
                            {label}
                        </a>
                    ),
            });
        }
    }

    if (entries.length === 0) {
        return null;
    }

    return (
        <ul
            className={cn('cv-contact', className)}
            data-icons={icons || undefined}
        >
            {entries.map(({ key, kind, node }) => {
                const Icon = CONTACT_ICONS[kind];

                return (
                    <li key={key}>
                        {icons && (
                            <Icon className="cv-contact-icon" aria-hidden />
                        )}
                        {node}
                    </li>
                );
            })}
        </ul>
    );
}

export function Photo({ className }: { className?: string }) {
    const { item, settings } = useHeader();

    if (!settings.showPhoto || !item.photo) {
        return null;
    }

    return (
        <img
            src={item.photo.src}
            alt=""
            className={cn('cv-photo', className)}
            data-shape={item.photo.shape}
        />
    );
}

/** Level 0–5 as a bar. */
export function Meter({ level, label }: { level: number; label: string }) {
    return (
        <span
            className="cv-meter"
            role="img"
            aria-label={label}
            style={{ '--level': level } as CSSProperties}
        >
            <span />
        </span>
    );
}

/** Level 1–5 as five dots. */
export function Dots({ level, label }: { level: number; label: string }) {
    return (
        <span className="cv-dots" role="img" aria-label={label}>
            {[1, 2, 3, 4, 5].map((n) => (
                <span key={n} data-on={n <= level || undefined} />
            ))}
        </span>
    );
}

/** The current item's keywords as "a, b, c"; editable in the editor. */
export function Keywords({
    className,
    prefix,
}: {
    className?: string;
    prefix?: (text: string) => ReactNode;
}) {
    const { mode } = useRender();
    const edit = useEdit();
    const { section, item } = useItem();
    const keywords = ((item as AnyRecord).keywords as string[]) ?? [];
    const def = fieldDef(section.type, 'keywords');

    if (def?.toggle && (section.settings as AnyRecord)[def.toggle] === false) {
        return null;
    }

    if (mode === 'edit' && edit) {
        return (
            <edit.Keywords
                value={keywords}
                onChange={(value) =>
                    edit.setField(section.id, item.id, 'keywords', value)
                }
                placeholder="Keywords, comma separated"
                label={def?.label ?? 'Keywords'}
                className={className}
            />
        );
    }

    if (keywords.length === 0) {
        return null;
    }

    const text = keywords.join(', ');

    return <span className={className}>{prefix ? prefix(text) : text}</span>;
}

/** The current skill's level as a bar; clickable in the editor. */
export function LevelMeter() {
    const { mode } = useRender();
    const edit = useEdit();
    const { section, item } = useItem();
    const level = ((item as AnyRecord).level as number) ?? 0;

    if (mode === 'edit' && edit) {
        return (
            <edit.Level
                level={level}
                onChange={(value) =>
                    edit.setField(section.id, item.id, 'level', value)
                }
            />
        );
    }

    return <Meter level={level} label={`${level} out of 5`} />;
}

/** Wraps a proficiency display; in the editor it becomes a picker. */
export function ProficiencyControl({ children }: { children: ReactNode }) {
    const { mode } = useRender();
    const edit = useEdit();
    const { section, item } = useItem();
    const value = (item as AnyRecord).proficiency as LanguageProficiency;

    if (mode === 'edit' && edit) {
        return (
            <edit.Proficiency
                value={value}
                onChange={(next) =>
                    edit.setField(section.id, item.id, 'proficiency', next)
                }
            >
                {children}
            </edit.Proficiency>
        );
    }

    return <>{children}</>;
}
