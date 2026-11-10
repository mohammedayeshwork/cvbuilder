import { Check, RotateCcw } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { FONT_PAIRS } from '@/design/fonts';
import { PALETTES } from '@/design/palettes';
import { resolveDesign } from '@/design/resolve';
import { cn } from '@/lib/utils';
import { DocumentPreview } from '@/renderer/DocumentPreview';
import {
    BACKGROUNDS,
    DATE_FORMATS,
    DESIGN_LIMITS,
    TEMPLATE_KEYS,
} from '@/schema';
import type {
    Design,
    DesignOverrides,
    ResumeContent,
    TemplateKey,
} from '@/schema';
import { TEMPLATE_CATALOG } from '@/templates/catalog';
import { getTemplate } from '@/templates/registry';
import { useEditor, useEditorStore } from '../context';
import {
    resetDesign,
    setDesign,
    SIZE_PRESETS,
    switchTemplate,
} from './operations';

const BACKGROUND_LABELS: Record<(typeof BACKGROUNDS)[number], string> = {
    none: 'None',
    dots: 'Dots',
    grid: 'Grid',
    lines: 'Lines',
    corner: 'Corner',
};

/** Template, colors, fonts, sizes and page options. */
export function DesignPanel() {
    const store = useEditorStore();
    const type = useEditor((state) => state.type);
    const content = useEditor((state) => state.content);
    const overrides = useEditor((state) => state.design);
    const templateKey = useEditor((state) => state.template_key);
    const design = resolveDesign(getTemplate(templateKey).design, overrides);

    const update = (patch: Partial<DesignOverrides>, group?: string) =>
        store
            .getState()
            .change(
                { design: setDesign(store.getState().design, patch) },
                group,
            );

    const chooseTemplate = (key: TemplateKey) => {
        const state = store.getState();
        state.change({
            template_key: key,
            content:
                state.type === 'resume'
                    ? switchTemplate(state.content as ResumeContent, key)
                    : state.content,
        });
    };

    return (
        <aside
            className="flex w-full flex-col gap-6 lg:w-80"
            aria-label="Design"
        >
            <div className="flex items-center justify-between">
                <h2 className="font-medium">Design</h2>
                <Button
                    variant="ghost"
                    size="sm"
                    disabled={Object.keys(overrides).length <= 1}
                    onClick={() =>
                        store
                            .getState()
                            .change({ design: resetDesign(overrides) })
                    }
                >
                    <RotateCcw /> Reset
                </Button>
            </div>

            <Group title="Template">
                <ul className="grid grid-cols-3 gap-2">
                    {TEMPLATE_KEYS.map((key) => {
                        const info = TEMPLATE_CATALOG.find(
                            (t) => t.key === key,
                        )!;
                        const active = key === templateKey;

                        return (
                            <li key={key}>
                                <button
                                    type="button"
                                    aria-pressed={active}
                                    onClick={() => chooseTemplate(key)}
                                    className={cn(
                                        'flex w-full flex-col gap-1 rounded-md border p-1 text-start text-[11px] focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
                                        active
                                            ? 'border-primary ring-1 ring-primary'
                                            : 'hover:border-foreground/30',
                                    )}
                                >
                                    <DocumentPreview
                                        document={{
                                            type,
                                            template_key: key,
                                            content,
                                            design: overrides,
                                        }}
                                    />
                                    <span className="truncate px-0.5">
                                        {info.name}
                                    </span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </Group>

            <Group title="Color">
                <div
                    className="flex flex-wrap gap-2"
                    role="radiogroup"
                    aria-label="Palette"
                >
                    {Object.values(PALETTES).map((palette) => (
                        <button
                            key={palette.key}
                            type="button"
                            role="radio"
                            aria-checked={design.palette === palette.key}
                            aria-label={palette.name}
                            title={palette.name}
                            onClick={() =>
                                update({
                                    palette: palette.key,
                                    accent: undefined,
                                })
                            }
                            className="flex size-7 items-center justify-center rounded-full ring-offset-2 ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none aria-checked:ring-2 aria-checked:ring-foreground"
                            style={{ background: palette.accent }}
                        >
                            {design.palette === palette.key && (
                                <Check className="size-3.5 text-white" />
                            )}
                        </button>
                    ))}
                    <label
                        className={cn(
                            'relative flex size-7 cursor-pointer items-center justify-center rounded-full border text-[10px] ring-offset-2 ring-offset-background focus-within:ring-2 focus-within:ring-ring',
                            design.palette === 'custom' &&
                                'ring-2 ring-foreground',
                        )}
                        style={
                            design.palette === 'custom'
                                ? { background: design.accent }
                                : undefined
                        }
                        title="Custom color"
                    >
                        {design.palette !== 'custom' && '+'}
                        <input
                            type="color"
                            aria-label="Custom color"
                            className="absolute inset-0 cursor-pointer opacity-0"
                            value={design.accent}
                            onChange={(event) =>
                                update(
                                    {
                                        palette: 'custom',
                                        accent: event.target.value,
                                    },
                                    'design:accent',
                                )
                            }
                        />
                    </label>
                </div>
            </Group>

            <Group title="Fonts">
                <select
                    aria-label="Font pair"
                    className="h-9 w-full rounded-md border bg-background px-2 text-sm"
                    value={design.fontPair}
                    onChange={(event) =>
                        update({
                            fontPair: event.target.value as Design['fontPair'],
                        })
                    }
                >
                    {Object.values(FONT_PAIRS).map((pair) => (
                        <option key={pair.key} value={pair.key}>
                            {pair.name}
                        </option>
                    ))}
                </select>
            </Group>

            <Group title="Size and spacing">
                <ToggleGroup
                    type="single"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onValueChange={(value) =>
                        value &&
                        update(SIZE_PRESETS[value as keyof typeof SIZE_PRESETS])
                    }
                >
                    <ToggleGroupItem value="compact">Compact</ToggleGroupItem>
                    <ToggleGroupItem value="normal">Normal</ToggleGroupItem>
                    <ToggleGroupItem value="spacious">Spacious</ToggleGroupItem>
                </ToggleGroup>
                <Range
                    label="Font size"
                    unit="pt"
                    step={0.5}
                    {...DESIGN_LIMITS.fontSize}
                    value={design.fontSize}
                    onChange={(fontSize) =>
                        update({ fontSize }, 'design:fontSize')
                    }
                />
                <Range
                    label="Line height"
                    step={0.05}
                    {...DESIGN_LIMITS.lineHeight}
                    value={design.lineHeight}
                    onChange={(lineHeight) =>
                        update({ lineHeight }, 'design:lineHeight')
                    }
                />
                <Range
                    label="Section spacing"
                    unit="×"
                    step={0.1}
                    {...DESIGN_LIMITS.sectionSpacing}
                    value={design.sectionSpacing}
                    onChange={(sectionSpacing) =>
                        update({ sectionSpacing }, 'design:sectionSpacing')
                    }
                />
                <Range
                    label="Page margins"
                    unit="mm"
                    step={1}
                    {...DESIGN_LIMITS.pageMargin}
                    value={design.pageMargin}
                    onChange={(pageMargin) =>
                        update({ pageMargin }, 'design:pageMargin')
                    }
                />
            </Group>

            <Group title="Page">
                <Field label="Paper size">
                    <ToggleGroup
                        type="single"
                        variant="outline"
                        size="sm"
                        value={design.pageSize}
                        onValueChange={(value) =>
                            value &&
                            update({ pageSize: value as Design['pageSize'] })
                        }
                    >
                        <ToggleGroupItem value="A4">A4</ToggleGroupItem>
                        <ToggleGroupItem value="Letter">
                            US Letter
                        </ToggleGroupItem>
                    </ToggleGroup>
                </Field>
                <Field label="Background">
                    <select
                        aria-label="Background"
                        className="h-9 w-full rounded-md border bg-background px-2 text-sm"
                        value={design.background}
                        onChange={(event) =>
                            update({
                                background: event.target
                                    .value as Design['background'],
                            })
                        }
                    >
                        {BACKGROUNDS.map((background) => (
                            <option key={background} value={background}>
                                {BACKGROUND_LABELS[background]}
                            </option>
                        ))}
                    </select>
                </Field>
                <Field label="Dates">
                    <select
                        aria-label="Date format"
                        className="h-9 w-full rounded-md border bg-background px-2 text-sm"
                        value={design.dateFormat}
                        onChange={(event) =>
                            update({
                                dateFormat: event.target
                                    .value as Design['dateFormat'],
                            })
                        }
                    >
                        {DATE_FORMATS.map((format) => (
                            <option key={format} value={format}>
                                {SAMPLE_DATES[format]}
                            </option>
                        ))}
                    </select>
                </Field>
            </Group>

            <Group title="Section titles">
                <ToggleGroup
                    type="single"
                    variant="outline"
                    size="sm"
                    value={design.sectionTitle.case}
                    onValueChange={(value) =>
                        value &&
                        update({
                            sectionTitle: {
                                case: value as Design['sectionTitle']['case'],
                            },
                        })
                    }
                >
                    <ToggleGroupItem value="upper">UPPER</ToggleGroupItem>
                    <ToggleGroupItem
                        value="smallcaps"
                        style={{ fontVariantCaps: 'all-small-caps' }}
                    >
                        Small caps
                    </ToggleGroupItem>
                    <ToggleGroupItem value="title">Title</ToggleGroupItem>
                </ToggleGroup>
                <Toggle
                    id="design-underline"
                    label="Rule under titles"
                    checked={design.sectionTitle.underline}
                    onChange={(underline) =>
                        update({ sectionTitle: { underline } })
                    }
                />
                <Toggle
                    id="design-icons"
                    label="Icons"
                    checked={design.sectionTitle.icons}
                    onChange={(icons) => update({ sectionTitle: { icons } })}
                />
            </Group>
        </aside>
    );
}

const SAMPLE_DATES: Record<Design['dateFormat'], string> = {
    'MMM YYYY': 'Mar 2024',
    'MMMM YYYY': 'March 2024',
    'MM/YYYY': '03/2024',
    'YYYY-MM': '2024-03',
    YYYY: '2024',
};

function Group({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="flex flex-col gap-3">
            <h3 className="text-xs font-medium text-muted-foreground uppercase">
                {title}
            </h3>
            {children}
        </section>
    );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="grid grid-cols-[6rem_1fr] items-center gap-2">
            <span className="text-sm">{label}</span>
            {children}
        </div>
    );
}

function Range({
    label,
    unit = '',
    min,
    max,
    step,
    value,
    onChange,
}: {
    label: string;
    unit?: string;
    min: number;
    max: number;
    step: number;
    value: number;
    onChange: (value: number) => void;
}) {
    const id = `range-${label.replace(/\s+/g, '-').toLowerCase()}`;

    return (
        <div className="grid gap-1">
            <div className="flex justify-between text-sm">
                <Label htmlFor={id}>{label}</Label>
                <span className="text-muted-foreground tabular-nums">
                    {Number(value.toFixed(2))}
                    {unit}
                </span>
            </div>
            <input
                id={id}
                type="range"
                className="w-full accent-primary"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(event) => onChange(Number(event.target.value))}
            />
        </div>
    );
}

function Toggle({
    id,
    label,
    checked,
    onChange,
}: {
    id: string;
    label: string;
    checked: boolean;
    onChange: (value: boolean) => void;
}) {
    return (
        <div className="flex items-center gap-2">
            <Checkbox
                id={id}
                checked={checked}
                onCheckedChange={(value) => onChange(value === true)}
            />
            <Label htmlFor={id}>{label}</Label>
        </div>
    );
}
