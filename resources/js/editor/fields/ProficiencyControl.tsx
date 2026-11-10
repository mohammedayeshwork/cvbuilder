import type { ReactNode } from 'react';
import type { LanguageProficiency } from '@/schema';
import { PROFICIENCY_LABELS } from '@/sections/languages/fields';

/** The proficiency display with a transparent native select laid over it. */
export function ProficiencyControl({
    value,
    onChange,
    children,
}: {
    value: LanguageProficiency;
    onChange: (value: LanguageProficiency) => void;
    children: ReactNode;
}) {
    return (
        <span className="cv-select-overlay">
            {children}
            <select
                aria-label="Proficiency"
                value={value}
                onChange={(event) =>
                    onChange(event.target.value as LanguageProficiency)
                }
            >
                {Object.entries(PROFICIENCY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                        {label}
                    </option>
                ))}
            </select>
        </span>
    );
}
