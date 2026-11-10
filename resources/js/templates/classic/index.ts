import './styles.css';
import { templateInfo } from '../catalog';
import type { TemplateDefinition } from '../types';
import design from './defaults';
import { Header, Page } from './Resume';
import thumbnail from './thumbnail';

export default {
    info: templateInfo('classic'),
    design,
    entryLayout: 'stacked',
    Header,
    Page,
    thumbnail,
} satisfies TemplateDefinition;
