import { useMemo } from 'react';
import type { EditBindings } from '@/renderer/edit';
import { useApply } from './actions';
import { ItemFrame } from './canvas/ItemFrame';
import { SectionFrame } from './canvas/SectionFrame';
import { DatesControl } from './fields/DatesControl';
import { Editable } from './fields/Editable';
import { KeywordsEditable } from './fields/KeywordsEditable';
import { LevelControl } from './fields/LevelControl';
import { ProficiencyControl } from './fields/ProficiencyControl';
import { RichEditable } from './fields/RichEditable';
import { setItemField, updateSection } from './operations';

/** The editor's implementation of what the renderer needs in edit mode. */
export function useEditBindings(): EditBindings {
    const apply = useApply();

    return useMemo(
        () => ({
            setField: (sectionId, itemId, key, value) =>
                apply(
                    (c) => setItemField(c, sectionId, itemId, key, value),
                    `${itemId}:${key}`,
                ),
            setSectionTitle: (sectionId, title) =>
                apply(
                    (c) => updateSection(c, sectionId, { title }),
                    `${sectionId}:title`,
                ),
            Text: Editable,
            Rich: RichEditable,
            Keywords: KeywordsEditable,
            Dates: DatesControl,
            Level: LevelControl,
            Proficiency: ProficiencyControl,
            ItemFrame,
            SectionFrame,
        }),
        // apply only reads the store at call time
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );
}
