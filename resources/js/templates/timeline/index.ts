import './styles.css';
import { templateInfo } from '../catalog';
import type { TemplateDefinition } from '../types';
import design from './defaults';
import { Header, Page } from './Resume';
import thumbnail from './thumbnail';

export default {
    info: templateInfo('timeline'),
    design,
    entryLayout: 'timeline',
    Header,
    Page,
    thumbnail,
} satisfies TemplateDefinition;
