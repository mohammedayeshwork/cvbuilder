import { useId, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useItem, useRender } from '@/renderer/context';
import { useEdit } from '@/renderer/edit';
import { formatPartialDate, formatRange } from '@/renderer/format';
import type { PartialDate } from '@/schema';
import { fieldDef } from '@/sections/fields';

const MONTHS = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
];

type Dated = {
    start?: PartialDate;
    end?: PartialDate;
    current?: boolean;
    date?: PartialDate;
};

/** The item's dates as text; click to pick months and years. */
export function DatesControl({ className }: { className?: string }) {
    const { design } = useRender();
    const edit = useEdit()!;
    const { section, item } = useItem();
    const record = item as unknown as Dated;
    const ranged = 'start' in record;
    const settings = section.settings as Record<string, unknown>;
    const def = fieldDef(section.type, ranged ? 'start' : 'date');

    if (!def || (def.toggle && settings[def.toggle] === false)) {
        return null;
    }

    const text = ranged
        ? formatRange(
              record.start ?? null,
              record.end ?? null,
              record.current === true,
              design.dateFormat,
          )
        : formatPartialDate(record.date ?? null, design.dateFormat);
    const set = (key: keyof Dated, value: unknown) =>
        edit.setField(section.id, item.id, key, value);
    const currentLabel = fieldDef(section.type, 'current')?.label ?? 'Ongoing';

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className={cn(
                        'cv-dates cv-date-trigger',
                        text === '' && 'cv-placeholder',
                        className,
                    )}
                    aria-label={
                        text ? `Dates: ${text}. Change dates` : 'Add dates'
                    }
                >
                    {text || 'Add dates'}
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto space-y-3" align="end">
                {ranged ? (
                    <>
                        <PartialDateInput
                            label="Start"
                            value={record.start ?? null}
                            onChange={(v) => set('start', v)}
                        />
                        <PartialDateInput
                            label="End"
                            value={record.end ?? null}
                            disabled={record.current === true}
                            onChange={(v) => set('end', v)}
                        />
                        {'current' in record && (
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id={`current-${item.id}`}
                                    checked={record.current === true}
                                    onCheckedChange={(checked) =>
                                        set('current', checked === true)
                                    }
                                />
                                <Label htmlFor={`current-${item.id}`}>
                                    {currentLabel}
                                </Label>
                            </div>
                        )}
                    </>
                ) : (
                    <PartialDateInput
                        label="Date"
                        value={record.date ?? null}
                        onChange={(v) => set('date', v)}
                    />
                )}
            </PopoverContent>
        </Popover>
    );
}

/** Month (optional) and year. Emits "YYYY", "YYYY-MM" or null. */
export function PartialDateInput({
    label,
    value,
    onChange,
    disabled,
}: {
    label: string;
    value: PartialDate;
    onChange: (value: PartialDate) => void;
    disabled?: boolean;
}) {
    const [year, month] = (value ?? '').split('-');
    const [yearText, setYearText] = useState(year ?? '');
    const id = useId();

    const emit = (nextYear: string, nextMonth: string | undefined) => {
        if (!/^\d{4}$/.test(nextYear)) {
            onChange(null);
            return;
        }
        onChange(nextMonth ? `${nextYear}-${nextMonth}` : nextYear);
    };

    return (
        <fieldset
            className="grid grid-cols-[4rem_1fr_5rem] items-center gap-2"
            disabled={disabled}
        >
            <legend className="sr-only">{label}</legend>
            <Label
                htmlFor={`${id}-month`}
                className={cn(disabled && 'opacity-50')}
            >
                {label}
            </Label>
            <select
                id={`${id}-month`}
                aria-label={`${label} month`}
                className="h-9 rounded-md border bg-background px-2 text-sm disabled:opacity-50"
                value={month ?? ''}
                onChange={(event) =>
                    emit(yearText, event.target.value || undefined)
                }
            >
                <option value="">No month</option>
                {MONTHS.map((name, i) => (
                    <option key={name} value={String(i + 1).padStart(2, '0')}>
                        {name}
                    </option>
                ))}
            </select>
            <input
                aria-label={`${label} year`}
                inputMode="numeric"
                placeholder="YYYY"
                maxLength={4}
                className="h-9 w-full rounded-md border bg-background px-2 text-sm tabular-nums disabled:opacity-50"
                value={yearText}
                onChange={(event) => {
                    const next = event.target.value
                        .replace(/\D/g, '')
                        .slice(0, 4);
                    setYearText(next);
                    if (next.length === 4 || next.length === 0) {
                        emit(next, month);
                    }
                }}
            />
        </fieldset>
    );
}
