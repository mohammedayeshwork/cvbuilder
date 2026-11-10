/** The level bar with five invisible click targets over it. */
export function LevelControl({
    level,
    onChange,
}: {
    level: number;
    onChange: (level: number) => void;
}) {
    return (
        <span
            className="cv-meter cv-level-control"
            style={{ '--level': level } as React.CSSProperties}
        >
            <span />
            <span
                className="cv-level-targets"
                role="radiogroup"
                aria-label="Skill level"
            >
                {[1, 2, 3, 4, 5].map((n) => (
                    <button
                        key={n}
                        type="button"
                        role="radio"
                        aria-checked={level === n}
                        aria-label={`Level ${n} of 5`}
                        onClick={() => onChange(level === n ? n - 1 : n)}
                    />
                ))}
            </span>
        </span>
    );
}
