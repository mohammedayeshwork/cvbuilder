import { bullets, para, persona } from './helpers';
import type { Sample } from './helpers';

const { section, resume } = persona('msp');

export default {
    key: 'modern-split',
    title: 'Priya Raman — Product Designer',
    design: { version: 1 },
    content: resume(
        section('header', [
            {
                name: 'Priya Raman',
                title: 'Senior Product Designer',
                phone: '+1 415 555 0198',
                email: 'priya.raman@example.com',
                location: 'San Francisco, CA',
                links: [
                    {
                        label: 'priyaraman.design',
                        url: 'https://priyaraman.design',
                    },
                    {
                        label: 'dribbble.com/priyar',
                        url: 'https://dribbble.com/priyar',
                    },
                ],
            },
        ]),
        section('summary', [
            {
                text: para(
                    'Product designer with seven years of experience shipping B2B and fintech products. I like turning messy workflows into calm interfaces, and I back design decisions with research. Currently leading design for a payments platform used by 30,000 small businesses.',
                ),
            },
        ]),
        section('experience', [
            {
                role: 'Senior Product Designer',
                company: 'Ledgerly',
                location: 'San Francisco, CA',
                link: 'ledgerly.example.com',
                start: '2022-02',
                current: true,
                description: bullets(
                    'Lead designer for invoicing and payouts, working with 3 product squads.',
                    'Redesigned onboarding, which raised activation from 41% to 63% in two quarters.',
                    'Started and maintain the Ledgerly design system (180 components, used by 40 engineers).',
                    'Run monthly usability sessions with customers and share the findings with leadership.',
                ),
            },
            {
                role: 'Product Designer',
                company: 'Fieldnote',
                location: 'Oakland, CA',
                start: '2019-06',
                end: '2022-01',
                description: bullets(
                    'Designed the mobile app for field technicians, which reached a 4.8 rating in the App Store.',
                    'Introduced design critiques and a shared research repository for the product team.',
                    'Worked with engineering to cut the time from first sketch to shipped feature by 30%.',
                ),
            },
            {
                role: 'UX Designer',
                company: 'Brightpath Agency',
                location: 'Austin, TX',
                start: '2017-08',
                end: '2019-05',
                description: bullets(
                    'Delivered websites and apps for 14 clients in health care, education and retail.',
                    'Ran discovery workshops and turned their output into wireframes and prototypes.',
                ),
            },
        ]),
        section('projects', [
            {
                name: 'Open Accessibility Checklist',
                role: 'Creator',
                link: 'github.com/priyar/a11y-checklist',
                start: '2021',
                description: para(
                    'A free checklist for designers that maps WCAG 2.2 criteria to design decisions. Used by more than 2,000 people each month.',
                ),
            },
        ]),
        section('education', [
            {
                degree: 'BFA Interaction Design',
                institution: 'California College of the Arts',
                location: 'San Francisco, CA',
                start: '2013',
                end: '2017',
            },
        ]),
        section(
            'skills',
            [
                {
                    name: 'Design',
                    level: 5,
                    keywords: [
                        'Figma',
                        'Prototyping',
                        'Design systems',
                        'Interaction design',
                    ],
                },
                {
                    name: 'Research',
                    level: 4,
                    keywords: [
                        'Usability testing',
                        'Interviews',
                        'Journey mapping',
                    ],
                },
                {
                    name: 'Front end',
                    level: 3,
                    keywords: ['HTML', 'CSS', 'React basics'],
                },
            ],
            { column: 'side', settings: { display: 'grouped' } },
        ),
        section(
            'languages',
            [
                { name: 'English', proficiency: 'fluent' },
                { name: 'Tamil', proficiency: 'native' },
                { name: 'Spanish', proficiency: 'intermediate' },
            ],
            { column: 'side', settings: { display: 'dots' } },
        ),
        section(
            'awards',
            [
                {
                    title: 'Fintech Design Award, Finalist',
                    issuer: 'UX Collective',
                    date: '2023',
                },
            ],
            { column: 'side' },
        ),
        section(
            'interests',
            [
                { name: 'Ceramics', keywords: [] },
                { name: 'Trail running', keywords: [] },
                { name: 'Type design', keywords: [] },
            ],
            { column: 'side', settings: { showKeywords: false } },
        ),
    ),
} satisfies Sample;
