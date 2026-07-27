export interface ResumeProject {
  title: string;
  description: string;
}

export interface ResumeData {
  name: string;
  bio: string;
  experience: string[];
  projects: ResumeProject[];
}

const projects: ResumeProject[] = [
  {
    title: 'SITEMAKER',
    description: 'turns a resume into a clean personal site with sections, theme presets, and deploy-ready pages',
  },
  {
    title: 'SEVA EATS',
    description: 'connects gurdwara meals to families in need with simple listings, requests, and pickup details',
  },
  {
    title: 'SPY',
    description: 'built my own guess the imposter party game app with no ads, open source code, and a simple interface that allows you to customize the game',
  },
  {
    title: 'GFSS CALENDAR',
    description: 'full stack calendar app used by clubs and school admin to present club meetings and events, used by my school with 1k+ monthly users',
  },
  {
    title: 'GQ PLANETS',
    description: 'machine learning tool that classifies possible exoplanets using nasas kepler, k2, and tess mission data',
  },
  {
    title: 'MIWAY LEADERBOARD',
    description: 'tracks miway bus speeds live using mississaugas realtime api and shows a ranked feed',
  },
  {
    title: 'NUMS',
    description: 'tiny go service for counting page views with a clean json api and badge output',
  },
];

const experience = [
  'built website and internal tools for a research club at the university of toronto that focuses on neurotechnology research',
  'wrote and managed region wide programming contests and organized events for my high school computer science club',
  'coded website for a healthcare nonprofit that provides free healthcare to teens interested in medicine',
];

export const getResumeData = (age: number): ResumeData => ({
  name: 'ADVAY CHANDORKAR',
  bio: `im a ${age} year old full-stack developer from toronto, on · incoming CE at QUEENS UNIVERSITY`,
  experience,
  projects,
});