import { bullets, para, persona } from './helpers';
import type { Sample } from './helpers';

const { section, resume } = persona('cmp');

export default {
    key: 'compact',
    title: 'Lena Fischer — Data Engineer',
    design: { version: 1 },
    content: resume(
        section('header', [
            {
                name: 'Lena Fischer',
                title: 'Data Engineer',
                phone: '+49 30 5550 7788',
                email: 'lena.fischer@example.com',
                location: 'Berlin, Germany',
                links: [
                    {
                        label: 'github.com/lenafischer',
                        url: 'https://github.com/lenafischer',
                    },
                    {
                        label: 'linkedin.com/in/lenafischer',
                        url: 'https://linkedin.com/in/lenafischer',
                    },
                ],
            },
        ]),
        section('summary', [
            {
                text: para(
                    'Data engineer with five years of building batch and streaming pipelines for e-commerce and mobility companies. I keep data platforms boring, cheap and well documented, so analysts can trust what they query.',
                ),
            },
        ]),
        section('experience', [
            {
                role: 'Data Engineer',
                company: 'Velo Mobility',
                location: 'Berlin',
                start: '2022-01',
                current: true,
                description: bullets(
                    'Own the event pipeline for 2m daily trips (Kafka, Flink, BigQuery).',
                    'Cut warehouse costs by 46% through partitioning and dbt model cleanup.',
                    'Introduced data contracts with the app teams; schema-related incidents fell from 9 to 1 per quarter.',
                ),
            },
            {
                role: 'Junior Data Engineer',
                company: 'Marktplatz24',
                location: 'Hamburg',
                start: '2019-08',
                end: '2021-12',
                description: bullets(
                    'Migrated 140 cron jobs to Airflow with alerting and retries.',
                    'Built the product catalogue sync between PostgreSQL and Elasticsearch.',
                ),
            },
            {
                role: 'Working Student, Analytics',
                company: 'Marktplatz24',
                location: 'Hamburg',
                start: '2018-04',
                end: '2019-07',
                description: bullets(
                    'Built weekly sales dashboards in Tableau for the category teams.',
                ),
            },
        ]),
        section('projects', [
            {
                name: 'Berlin Bike Count Dashboard',
                role: 'Author',
                link: 'lenafischer.github.io/bikecount',
                start: '2023',
                description: para(
                    'Open data project visualising the city’s bike counter data, updated daily.',
                ),
            },
        ]),
        section(
            'education',
            [
                {
                    degree: 'MSc Computer Science',
                    institution: 'TU Hamburg',
                    location: 'Hamburg',
                    start: '2017',
                    end: '2019',
                },
                {
                    degree: 'BSc Mathematics',
                    institution: 'University of Leipzig',
                    location: 'Leipzig',
                    start: '2014',
                    end: '2017',
                },
            ],
            { column: 'side', settings: { showLocation: false } },
        ),
        section(
            'skills',
            [
                { name: 'Python', level: 5 },
                { name: 'SQL', level: 5 },
                { name: 'dbt', level: 4 },
                { name: 'Airflow', level: 4 },
                { name: 'Kafka', level: 3 },
                { name: 'Flink', level: 3 },
                { name: 'BigQuery', level: 4 },
                { name: 'Terraform', level: 3 },
            ],
            { column: 'side', settings: { display: 'tags' } },
        ),
        section(
            'certifications',
            [
                {
                    name: 'Google Cloud Professional Data Engineer',
                    issuer: 'Google Cloud',
                    date: '2022-06',
                },
            ],
            { column: 'side', settings: { showLink: false } },
        ),
        section(
            'languages',
            [
                { name: 'German', proficiency: 'native' },
                { name: 'English', proficiency: 'fluent' },
                { name: 'Polish', proficiency: 'basic' },
            ],
            { column: 'side' },
        ),
        section(
            'interests',
            [
                { name: 'Cycling', keywords: [] },
                { name: 'Bouldering', keywords: [] },
                { name: 'Open data', keywords: [] },
            ],
            { column: 'side', settings: { showKeywords: false } },
        ),
    ),
} satisfies Sample;
