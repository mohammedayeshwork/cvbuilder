import type {
    CoverLetterContent,
    DesignOverrides,
    DocumentType,
    ResumeContent,
    TemplateKey,
} from '@/schema';

interface DocumentBase {
    id: number;
    title: string;
    template_key: TemplateKey;
    design: DesignOverrides;
    linked_resume_id: number | null;
    is_public: boolean;
    share_slug: string | null;
    revision: number;
    created_at: string;
    updated_at: string;
}

export interface ResumeDocument extends DocumentBase {
    type: Extract<DocumentType, 'resume'>;
    content: ResumeContent;
}

export interface CoverLetterDocument extends DocumentBase {
    type: Extract<DocumentType, 'cover_letter'>;
    content: CoverLetterContent;
}

export type CvDocument = ResumeDocument | CoverLetterDocument;
