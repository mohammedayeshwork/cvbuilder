import { bullets, para, persona } from './helpers';
import type { Sample } from './helpers';

const { section, resume } = persona('tml');

/** A long, academic CV. The PDF tests use it as the 3-page sample. */
export default {
    key: 'timeline',
    title: 'Dr. Samuel Okafor — Research Scientist',
    design: { version: 1 },
    content: resume(
        section('header', [
            {
                name: 'Samuel Okafor',
                title: 'Research Scientist, Climate & Hydrology',
                phone: '+31 20 555 0172',
                email: 's.okafor@example.org',
                location: 'Amsterdam, Netherlands',
                links: [
                    {
                        label: 'orcid.org/0000-0002-1825-0097',
                        url: 'https://orcid.org/0000-0002-1825-0097',
                    },
                    {
                        label: 'samokafor.science',
                        url: 'https://samokafor.science',
                    },
                ],
            },
        ]),
        section('summary', [
            {
                text: para(
                    'Hydrologist with twelve years of research on flood forecasting, river basin modelling and climate adaptation in West Africa and Northern Europe. I lead interdisciplinary teams, have secured €4.8m in competitive funding, and work closely with water authorities so that research turns into early-warning systems people rely on.',
                ),
            },
        ]),
        section('experience', [
            {
                role: 'Senior Research Scientist',
                company: 'Delta Institute for Water Research',
                location: 'Amsterdam',
                start: '2020-09',
                current: true,
                description: bullets(
                    'Lead the Flood Resilience group (4 postdocs, 6 PhD students, 2 engineers).',
                    'Principal investigator on the EU Horizon project RIVERSENSE (€2.9m, 11 partners in 7 countries).',
                    'Developed an ensemble flood forecasting model now run operationally by two national agencies.',
                    'Built a data partnership with the Niger Basin Authority that gives researchers access to 40 years of gauge records.',
                    'Teach the graduate course “Hydrological Modelling under Uncertainty” (60 students a year).',
                ),
            },
            {
                role: 'Postdoctoral Researcher',
                company:
                    'University of Utrecht, Department of Physical Geography',
                location: 'Utrecht',
                start: '2017-01',
                end: '2020-08',
                description: bullets(
                    'Coupled land-surface and river-routing models to study compound flooding in deltas.',
                    'Published 9 peer-reviewed papers, including two in Nature Communications.',
                    'Co-supervised 3 PhD students, all of whom finished on time.',
                    'Organised the 2019 European Hydrology Summer School (120 participants).',
                ),
            },
            {
                role: 'Doctoral Researcher',
                company: 'Imperial College London',
                location: 'London',
                start: '2013-10',
                end: '2016-12',
                description: bullets(
                    'Thesis: “Data-sparse flood forecasting for the Niger River using satellite rainfall”.',
                    'Ran three field campaigns in Mali and Niger to install and calibrate river gauges.',
                    'Taught undergraduate labs in fluid mechanics and GIS.',
                ),
            },
            {
                role: 'Water Resources Engineer',
                company: 'Sahel Water Partners',
                location: 'Niamey, Niger',
                start: '2010-03',
                end: '2013-08',
                description: bullets(
                    'Designed small irrigation and water-harvesting schemes for 18 rural communities.',
                    'Trained 40 local technicians in gauge maintenance and data collection.',
                    'Wrote the technical reports that secured follow-on funding from two NGOs.',
                ),
            },
        ]),
        section('education', [
            {
                degree: 'PhD Civil & Environmental Engineering',
                institution: 'Imperial College London',
                location: 'London',
                start: '2013',
                end: '2016',
            },
            {
                degree: 'MSc Water Resources Engineering',
                institution: 'University of Birmingham',
                location: 'Birmingham',
                start: '2008',
                end: '2009',
                grade: 'Distinction',
            },
            {
                degree: 'BEng Civil Engineering',
                institution: 'University of Lagos',
                location: 'Lagos',
                start: '2003',
                end: '2008',
                grade: 'First Class',
            },
        ]),
        section('publications', [
            {
                title: 'Ensemble flood forecasting for data-sparse basins using satellite precipitation',
                publisher: 'Nature Communications 15, 2231',
                authors: 'Okafor S., de Vries M., Traoré A., Bakker L.',
                date: '2024-03',
                link: 'doi.org/10.1038/s41467-024-0000-1',
            },
            {
                title: 'Compound flooding in the Rhine–Meuse delta under sea-level rise',
                publisher: 'Water Resources Research 59(4)',
                authors: 'Bakker L., Okafor S., Janssen P.',
                date: '2023-04',
                link: 'doi.org/10.1029/2022WR000001',
            },
            {
                title: 'How useful are global hydrological models for local flood warnings?',
                publisher: 'Hydrology and Earth System Sciences 26, 4471–4490',
                authors: 'Okafor S., Mensah K., Laurent C.',
                date: '2022-09',
                link: 'doi.org/10.5194/hess-26-4471-2022',
            },
            {
                title: 'Satellite rainfall bias correction for the Niger basin',
                publisher: 'Journal of Hydrometeorology 22(6)',
                authors: 'Okafor S., Traoré A.',
                date: '2021-06',
                link: 'doi.org/10.1175/JHM-D-20-0001.1',
            },
            {
                title: 'Coupling land-surface and routing models for deltaic floods',
                publisher: 'Nature Communications 11, 5120',
                authors: 'Okafor S., Janssen P., de Vries M.',
                date: '2020-10',
                link: 'doi.org/10.1038/s41467-020-0000-2',
            },
            {
                title: 'Community gauge networks as a source of calibration data',
                publisher: 'Hydrological Sciences Journal 64(12)',
                authors: 'Mensah K., Okafor S.',
                date: '2019-09',
                link: 'doi.org/10.1080/02626667.2019.0000001',
            },
            {
                title: 'Uncertainty in flood frequency estimates from short records',
                publisher: 'Journal of Hydrology 570, 112–125',
                authors: 'Okafor S., Laurent C., Hughes R.',
                date: '2019-03',
                link: 'doi.org/10.1016/j.jhydrol.2019.000001',
            },
            {
                title: 'A low-cost river gauge for West African tributaries',
                publisher: 'Water Practice & Technology 12(2)',
                authors: 'Okafor S., Hughes R.',
                date: '2017-06',
                link: '',
            },
        ]),
        section('awards', [
            {
                title: 'Early Career Scientist Award',
                issuer: 'European Geosciences Union, Hydrological Sciences Division',
                date: '2022',
                description: para(
                    'For work on operational flood forecasting in data-sparse regions.',
                ),
            },
            {
                title: 'Veni Grant (€280,000)',
                issuer: 'Dutch Research Council (NWO)',
                date: '2019',
            },
            {
                title: 'Commonwealth Scholarship',
                issuer: 'Commonwealth Scholarship Commission',
                date: '2013',
            },
        ]),
        section('volunteer', [
            {
                role: 'Scientific Advisor',
                organization: 'Floodwatch Africa (non-profit)',
                location: 'Remote',
                start: '2018',
                current: true,
                description: para(
                    'Advise on sensor design and data quality for community flood-warning networks in 5 countries.',
                ),
            },
            {
                role: 'Mentor',
                organization: 'African Women in Geosciences',
                location: 'Remote',
                start: '2019',
                current: true,
                description: para(
                    'Mentor two early-career researchers each year on grant writing and publishing.',
                ),
            },
        ]),
        section('courses', [
            {
                name: 'Hydrological Modelling under Uncertainty',
                institution: 'Delta Institute (lecturer)',
                date: '2021',
                description: para(
                    'Graduate course, 5 ECTS, taught every autumn.',
                ),
            },
            {
                name: 'Machine Learning for Earth Sciences',
                institution: 'ETH Zürich Summer School',
                date: '2020-07',
            },
        ]),
        section(
            'skills',
            [
                {
                    name: 'Hydrological modelling',
                    level: 5,
                    keywords: ['wflow', 'LISFLOOD', 'HEC-RAS'],
                },
                {
                    name: 'Programming',
                    level: 4,
                    keywords: ['Python', 'R', 'Julia', 'Fortran'],
                },
                {
                    name: 'Remote sensing',
                    level: 4,
                    keywords: ['GPM', 'Sentinel-1', 'Google Earth Engine'],
                },
                {
                    name: 'Research leadership',
                    level: 5,
                    keywords: ['Grant writing', 'Supervision'],
                },
            ],
            { settings: { display: 'grouped' } },
        ),
        section(
            'languages',
            [
                { name: 'English', proficiency: 'native' },
                { name: 'Yoruba', proficiency: 'native' },
                { name: 'French', proficiency: 'advanced' },
                { name: 'Dutch', proficiency: 'intermediate' },
            ],
            { settings: { display: 'bars' } },
        ),
        section('references', [
            {
                name: 'Prof. Marieke de Vries',
                title: 'Chair of Hydrology',
                company: 'University of Utrecht',
                email: 'm.devries@example.org',
                phone: '+31 30 555 0101',
                relationship: 'Postdoctoral supervisor',
            },
            {
                name: 'Dr. Aminata Traoré',
                title: 'Head of Forecasting',
                company: 'Niger Basin Authority',
                email: 'a.traore@example.org',
                phone: '+227 20 55 01 02',
                relationship: 'Research partner since 2014',
            },
        ]),
    ),
} satisfies Sample;
