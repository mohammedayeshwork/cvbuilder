import { bullets, para, persona } from './helpers';
import type { Sample } from './helpers';

const { section, resume } = persona('cls');

export default {
    key: 'classic',
    title: 'Eleanor Whitfield — Senior Financial Analyst',
    design: { version: 1 },
    content: resume(
        section('header', [
            {
                name: 'Eleanor Whitfield',
                title: 'Senior Financial Analyst',
                phone: '+44 20 7946 0321',
                email: 'eleanor.whitfield@example.com',
                location: 'London, United Kingdom',
                links: [
                    {
                        label: 'linkedin.com/in/ewhitfield',
                        url: 'https://linkedin.com/in/ewhitfield',
                    },
                ],
            },
        ]),
        section('summary', [
            {
                text: para(
                    'Chartered financial analyst with nine years in corporate finance and FP&amp;A across retail and logistics. I build forecasting models that management actually uses, and I explain the numbers in plain language. Led the budget process for a £1.2bn division and cut the monthly close from eight working days to four.',
                ),
            },
        ]),
        section('experience', [
            {
                role: 'Senior Financial Analyst',
                company: 'Harrow & Lane Retail Group',
                location: 'London',
                start: '2021-03',
                current: true,
                description: bullets(
                    'Own the rolling 18-month forecast for the UK stores division (£1.2bn revenue, 240 sites).',
                    'Rebuilt the store-level P&amp;L model in Power BI, which replaced 31 spreadsheets and saves the team about 40 hours a month.',
                    'Shortened the month-end close from 8 to 4 working days by automating accrual reconciliations.',
                    'Prepare the quarterly board pack and present variance analysis to the CFO.',
                ),
            },
            {
                role: 'Financial Analyst',
                company: 'Northgate Logistics',
                location: 'Manchester',
                start: '2018-01',
                end: '2021-02',
                description: bullets(
                    'Built the capital expenditure appraisal model used for a £45m warehouse automation programme.',
                    'Partnered with operations on cost-to-serve analysis, which identified £3.1m of annual savings.',
                    'Introduced driver-based budgeting for fleet costs and cut forecast error from 9% to 3%.',
                ),
            },
            {
                role: 'Graduate Analyst',
                company: 'Pembroke Advisory',
                location: 'Leeds',
                start: '2015-09',
                end: '2017-12',
                description: bullets(
                    'Supported due diligence on 12 mid-market acquisitions in the consumer sector.',
                    'Prepared three-statement models and sensitivity analyses for client pitch books.',
                ),
            },
        ]),
        section('education', [
            {
                degree: 'MSc Finance',
                institution: 'London School of Economics',
                location: 'London',
                start: '2014',
                end: '2015',
                grade: 'Distinction',
            },
            {
                degree: 'BSc Economics',
                institution: 'University of Bristol',
                location: 'Bristol',
                start: '2011',
                end: '2014',
                grade: 'First Class Honours',
            },
        ]),
        section('certifications', [
            {
                name: 'Chartered Financial Analyst (CFA)',
                issuer: 'CFA Institute',
                date: '2019',
            },
            {
                name: 'Financial Modelling & Valuation Analyst',
                issuer: 'Corporate Finance Institute',
                date: '2017',
            },
        ]),
        section(
            'skills',
            [
                { name: 'Financial modelling', level: 5 },
                { name: 'Forecasting & budgeting', level: 5 },
                { name: 'Power BI', level: 4 },
                { name: 'SQL', level: 3 },
                { name: 'Excel / VBA', level: 5 },
                { name: 'Stakeholder reporting', level: 4 },
            ],
            { settings: { display: 'tags' } },
        ),
        section('languages', [
            { name: 'English', proficiency: 'native' },
            { name: 'French', proficiency: 'advanced' },
        ]),
    ),
} satisfies Sample;
