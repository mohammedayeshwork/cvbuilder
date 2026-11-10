import { bullets, para, persona } from './helpers';
import type { Sample } from './helpers';

const { section, resume } = persona('bld');

export default {
    key: 'bold-header',
    title: 'Marcus Delgado — Marketing Manager',
    design: { version: 1 },
    content: resume(
        section('header', [
            {
                name: 'Marcus Delgado',
                title: 'Growth Marketing Manager',
                phone: '+1 312 555 0147',
                email: 'marcus.delgado@example.com',
                location: 'Chicago, IL',
                links: [
                    {
                        label: 'linkedin.com/in/marcusdelgado',
                        url: 'https://linkedin.com/in/marcusdelgado',
                    },
                    {
                        label: 'marcusdelgado.com',
                        url: 'https://marcusdelgado.com',
                    },
                ],
            },
        ]),
        section('summary', [
            {
                text: para(
                    'Growth marketer who has scaled two consumer subscription brands from early traction to eight-figure revenue. Comfortable owning a budget, running experiments every week and building a team. Known for clear reporting and for killing campaigns that do not work.',
                ),
            },
        ]),
        section('experience', [
            {
                role: 'Growth Marketing Manager',
                company: 'Brewline Coffee Subscriptions',
                location: 'Chicago, IL',
                start: '2021-05',
                current: true,
                description: bullets(
                    'Manage a $6m annual paid acquisition budget across Meta, Google, TikTok and podcasts.',
                    'Grew active subscribers from 48,000 to 155,000 while holding blended CAC under $38.',
                    'Built a team of 5 (performance, lifecycle, analytics) and hired every member.',
                    'Introduced a weekly experiment review; 120+ tests run in 2023 with a 28% win rate.',
                ),
            },
            {
                role: 'Senior Marketing Specialist',
                company: 'Kinfolk Meals',
                location: 'Chicago, IL',
                start: '2018-09',
                end: '2021-04',
                description: bullets(
                    'Launched referral programme that drove 22% of new customers within a year.',
                    'Rebuilt lifecycle email flows, lifting 90-day retention by 11 points.',
                    'Ran the first brand campaign, which reached 3.4m people across the Midwest.',
                ),
            },
            {
                role: 'Marketing Coordinator',
                company: 'Lakeshore Events',
                location: 'Evanston, IL',
                start: '2016-06',
                end: '2018-08',
                description: bullets(
                    'Coordinated marketing for 40+ events a year with attendance up to 8,000.',
                    'Managed social channels and grew Instagram following from 2k to 26k.',
                ),
            },
        ]),
        section('education', [
            {
                degree: 'BA Communication Studies',
                institution: 'Northwestern University',
                location: 'Evanston, IL',
                start: '2012',
                end: '2016',
            },
        ]),
        section(
            'skills',
            [
                { name: 'Paid social', level: 5 },
                { name: 'Search advertising', level: 4 },
                { name: 'Lifecycle & CRM', level: 4 },
                { name: 'Experiment design', level: 5 },
                { name: 'SQL & Looker', level: 3 },
                { name: 'Team leadership', level: 4 },
            ],
            { settings: { display: 'bars' } },
        ),
        section('volunteer', [
            {
                role: 'Marketing Mentor',
                organization: 'Chicago Youth Entrepreneurs',
                location: 'Chicago, IL',
                start: '2020',
                current: true,
                description: para(
                    'Mentor high-school founders on positioning and their first customer campaigns.',
                ),
            },
        ]),
        section('references', [], { settings: { onRequestOnly: true } }),
    ),
} satisfies Sample;
