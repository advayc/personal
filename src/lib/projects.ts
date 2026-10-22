export type Project = {
  slug: string;
  title: string;
  summary: string;
  year: string;
  gallery?: { src: string; alt: string; caption: string; width?: number; height?: number }[];
  imageCaption?: string;
  description: string[];
  image?: string;
  thumbnail?: string;
  imageAlt?: string;
  stack: string;
  url?: string;
  urlLabel?: string;
  links?: { label: string; href: string }[];
  githubLabel?: string;
  imageWidth?: number;
  imageHeight?: number;
  thumbnailWidth?: number;
  thumbnailHeight?: number;
  github: string;
};

export const projects: Project[] = [
  {
    slug: "wrapped",
    year: "2026",
    title: "wrapped",
    summary: "spotify wrapped, for your messages.",
    description: [
      "Wrapped turns your iMessage history into a private, browser-based recap for macOS. It is written in Go, and your message data stays on your Mac.",
    ],
    image: "/projects/wrapped-demo.png",
    imageWidth: 1920,
    imageHeight: 1080,
    imageAlt: "Wrapped message statistics interface with sample data",
    imageCaption: "the actual Wrapped interface, rendered with sample data",
    stack: "Go · local web interface",
    github: "https://github.com/advayc/wrapped",
  },
  {
    slug: "seva-eats",
    year: "2026",
    title: "seva eats",
    summary: "connecting community kitchens with families.",
    description: [
      "Seva Eats connects gurdwara kitchens with families looking for meals. The app brings meal listings, requests, and pickup details together.",
      "I worked on it with a friend in spring 2026, with guidance from professors at a leading Canadian business school and finance executives. I built route optimization and worked on the onboarding flow.",
    ],
    thumbnail: "/projects/seva-banner.png",
    image: "/projects/seva-banner.png",
    imageWidth: 1920,
    imageHeight: 1080,
    imageAlt: "Seva Eats community meal access banner",
    gallery: [
      {
        src: "/projects/seva-demo.png",
        alt: "Seva Eats mobile meal request onboarding",
        caption: "meal request onboarding",
        width: 430,
        height: 850,
      },
    ],
    stack: "React Native · TypeScript",
    url: "https://sevaeats.vercel.app/",
    github: "https://github.com/Seva-Eats/seva-eats",
  },
  {
    slug: "gfss-calendar",
    year: "2025",
    title: "gfss calendar",
    summary: "one place for everything happening at school.",
    description: [
      "GFSS Calendar puts club meetings and school events in one place. Clubs can post dates, and students can see what is happening across the school.",
      "I built it in late 2025 after seeing students miss meetings and clubs struggle to plan around each other. My school used it, and it reached more than 1,000 monthly active users.",
    ],
    image: "/projects/gfss-calendar-demo.png",
    imageWidth: 1440,
    imageHeight: 1000,
    imageAlt: "GFSS Calendar showing school club events",
    stack: "Next.js · TypeScript",
    url: "https://clubs.advay.ca/",
    github: "https://github.com/advayc/gfsscalender",
  },
  {
    slug: "gq-planets",
    year: "2025",
    title: "gq planets",
    summary: "testing NASA mission data for promising exoplanets.",
    description: [
      "GQ Planets was our NASA Space Apps project: a web app that uses Kepler, K2, and TESS observations to flag possible exoplanets. We trained a classifier on 18,413 records and made it possible to check one candidate or a whole CSV.",
    ],
    links: [
      { label: "NASA Space Apps submission", href: "https://www.spaceappschallenge.org/2025/find-a-team/the-sonic-waves/?tab=project" },
    ],
    image: "/projects/gq-planets.png",
    imageAlt: "GQ Planets exoplanet classification interface",
    imageWidth: 1722,
    imageHeight: 956,
    stack: "Python · PyTorch",
    github: "https://github.com/DeadUser123/Space-APPS-Hackathon",
    imageCaption: "GQ Planets · project interface",
  },
  {
    slug: "sitemaker",
    year: "2025",
    title: "sitemaker",
    summary: "from a résumé to a personal website.",
    description: [
      "Sitemaker turns a résumé into a personal website with pages for experience, skills, and projects.",
      "I built it in summer 2025. It includes theme presets and pages you can deploy as your own site.",
    ],
    image: "/projects/sitemaker-demo.png",
    imageWidth: 800,
    imageHeight: 446,
    thumbnailWidth: 1440,
    thumbnailHeight: 1000,
    imageAlt: "Sitemaker résumé upload screen",
    stack: "Next.js · TypeScript",
    url: "https://sitemaker.advay.ca/",
    github: "https://github.com/advayc/sitemaker",
  },
  {
    slug: "67-detector",
    year: "2025",
    title: "67 detector",
    summary: "hand gestures, reaction images, and drawing in the air.",
    description: [
      "An Instagram reel used hand gestures to trigger reaction images, so I made a 67 detector and an air-drawing program with OpenCV.",
      "I showed the project at my IB Theory of Knowledge exhibition in November 2025. It was voted the winner, and I presented it to 150 people in the library.",
    ],
    thumbnail: "/projects/67-exhibition.png",
    image: "/projects/67-drawing.jpeg",
    imageWidth: 664,
    imageHeight: 1182,
    thumbnailWidth: 1400,
    thumbnailHeight: 803,
    imageAlt: "OpenCV drawing program running on a laptop at the exhibition",
    imageCaption: "the drawing program at my IB TOK exhibition · november 2025",
    gallery: [
      {
        src: "/projects/67-exhibition.png",
        alt: "Advay presenting to students in the school library",
        caption: "presenting to 150 people in the library",
        width: 1400,
        height: 803,
      },
    ],
    stack: "Python · OpenCV",
    github: "https://github.com/advayc/67-detector",
  },
  {
    slug: "nums",
    year: "2025",
    title: "nums",
    summary: "a small Go API for page views, downloads, and badges.",
    description: [
      "Nums is an open-source hit counter and badge API. A Go server handles `/hit` and `/count`, and Redis stores the counts without tracking visitors.",
      "I built it in summer 2025, and it counts visits on this site. The demo below shows the API in use; the docs cover live requests and server-side tokens.",
    ],
    image: "/projects/nums.png",
    imageAlt: "Nums page-view counter project preview",
    imageWidth: 1440,
    imageHeight: 1000,
    stack: "Go",
    links: [
      { label: "API reference", href: "https://docs.advay.ca/api-reference/introduction" },
    ],
    github: "https://github.com/advayc/nums",
    githubLabel: "GitHub repository",
  },
  {
    slug: "spy",
    year: "2025",
    title: "spy",
    summary: "an open-source party game for your phone.",
    description: [
      "Spy is a phone version of the imposter game for a group in the same room.",
      "My friends and I played imposter at lunch on the first day of grade 12. I learned iOS development that week and shipped the app to the App Store the following week.",
    ],
    thumbnail: "/projects/spy-icon.png",
    image: "/projects/spy-icon.png",
    imageWidth: 1024,
    imageHeight: 1024,
    imageAlt: "Blue Spy eye icon uploaded by Advay",
    imageCaption: "spy · a party game for friends",
    gallery: [
      {
        src: "/projects/spy-demo-1.png",
        alt: "Spy game start screen",
        caption: "the app’s start screen",
        width: 1290,
        height: 2796,
      },
      {
        src: "/projects/spy-demo-2.png",
        alt: "Spy game setup",
        caption: "setting up a game",
        width: 1290,
        height: 2796,
      },
      {
        src: "/projects/spy-demo-3.png",
        alt: "Spy game screen",
        caption: "playing with friends",
        width: 1290,
        height: 2796,
      },
    ],
    stack: "React Native · TypeScript",
    url: "https://spy.advay.ca/",
    github: "https://github.com/advayc/spy",
  },
  {
    slug: "miway-leaderboard",
    year: "2026",
    title: "miway leaderboard",
    summary: "a live look at Mississauga’s buses.",
    description: ["A live leaderboard that ranks MiWay bus routes by their average speed from the transit feed."],
    image: "/projects/miway-leaderboard-demo-hq.gif",
    imageAlt: "MiWay live bus leaderboard",
    imageWidth: 800,
    imageHeight: 878,
    imageCaption: "five seconds on the live page · hover a speed to see m/s",
    stack: "TypeScript · Transit API",
    url: "https://miway.advay.ca/",
    github: "https://github.com/advayc/miway-leaderboard",
  },
];
