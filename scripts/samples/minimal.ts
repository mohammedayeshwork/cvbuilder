import { bullets, para, persona } from './helpers';
import type { Sample } from './helpers';

const { section, resume } = persona('min');

export default {
    key: 'minimal',
    title: 'Hana Sato — Software Engineer',
    design: { version: 1 },
    content: resume(
        section('header', [
            {
                name: 'Hana Sato',
                title: 'Backend Software Engineer',
                phone: '+81 90 5550 1123',
                email: 'hana.sato@example.com',
                location: 'Tokyo, Japan',
                links: [
                    {
                        label: 'github.com/hanasato',
                        url: 'https://github.com/hanasato',
                    },
                    { label: 'hanasato.dev', url: 'https://hanasato.dev' },
                ],
            },
        ]),
        section('summary', [
            {
                text: para(
                    'Backend engineer with six years of experience in distributed systems, payments and developer tooling. I care about reliable services, readable code and good on-call hygiene. Comfortable working in English and Japanese teams.',
                ),
            },
        ]),
        section('experience', [
            {
                role: 'Senior Software Engineer',
                company: 'Kumo Pay',
                location: 'Tokyo',
                start: '2022-04',
                current: true,
                description: bullets(
                    'Tech lead for the settlement service (Go, PostgreSQL, Kafka) processing ¥40bn a month.',
                    'Designed idempotent payout pipeline that removed duplicate transfers entirely.',
                    'Cut p99 API latency from 480 ms to 120 ms by redesigning the ledger read path.',
                    'Mentor 3 engineers and run the backend guild’s design review.',
                ),
            },
            {
                role: 'Software Engineer',
                company: 'Tsubame Logistics',
                location: 'Osaka',
                start: '2019-04',
                end: '2022-03',
                description: bullets(
                    'Built route-planning APIs in Python and Rust serving 1,200 delivery drivers.',
                    'Moved the deployment pipeline to Kubernetes and reduced release time from 45 to 8 minutes.',
                    'Wrote the internal guide to incident reviews that is still used today.',
                ),
            },
            {
                role: 'Junior Developer',
                company: 'Studio Hoshi',
                location: 'Osaka',
                start: '2018-04',
                end: '2019-03',
                description: bullets(
                    'Maintained PHP and Laravel sites for small business clients.',
                ),
            },
        ]),
        section('projects', [
            {
                name: 'pgdiff-lite',
                role: 'Maintainer',
                link: 'github.com/hanasato/pgdiff-lite',
                start: '2020',
                description: para(
                    'Open source tool that compares PostgreSQL schemas. 1.4k stars on GitHub.',
                ),
            },
            {
                name: 'Talk: “Exactly-once is a lie”',
                role: 'Speaker',
                link: '',
                start: '2023-10',
                description: para(
                    'Go Conference Tokyo 2023. About designing payment systems around retries.',
                ),
            },
        ]),
        section('education', [
            {
                degree: 'BEng Computer Science',
                institution: 'Osaka University',
                location: 'Osaka',
                start: '2014',
                end: '2018',
            },
        ]),
        section(
            'skills',
            [
                {
                    name: 'Languages',
                    level: 5,
                    keywords: ['Go', 'Python', 'Rust', 'SQL'],
                },
                {
                    name: 'Infrastructure',
                    level: 4,
                    keywords: ['Kubernetes', 'Terraform', 'AWS', 'GCP'],
                },
                {
                    name: 'Data',
                    level: 4,
                    keywords: ['PostgreSQL', 'Kafka', 'Redis'],
                },
            ],
            { settings: { display: 'grouped' } },
        ),
        section('languages', [
            { name: 'Japanese', proficiency: 'native' },
            { name: 'English', proficiency: 'fluent' },
        ]),
    ),
} satisfies Sample;
