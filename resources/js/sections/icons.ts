import {
    Award,
    BookOpen,
    Briefcase,
    FileText,
    FolderGit2,
    GraduationCap,
    HandHeart,
    Heart,
    Languages,
    Library,
    PenLine,
    ShieldCheck,
    Sparkles,
    User,
    Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { SectionType } from '@/schema';

export const SECTION_ICONS: Record<SectionType, LucideIcon> = {
    header: User,
    summary: FileText,
    experience: Briefcase,
    education: GraduationCap,
    skills: Sparkles,
    projects: FolderGit2,
    certifications: ShieldCheck,
    languages: Languages,
    awards: Award,
    volunteer: HandHeart,
    publications: Library,
    courses: BookOpen,
    interests: Heart,
    references: Users,
    custom: PenLine,
};
