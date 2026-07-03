export const fileConfigs = [
  {
    id: 'experience',
    filename: 'experience.exe',
    imageSrc: '/icons/computer.png',
    terminalConfig: {
      headerText: "advaychandorkar@personalsite: ~/personal/experiences (vim)",
      pathText: "~/personal/experiences",
      branchText: "main ✔",
      infoText: "previously: engineering, leadership, and community roles that shaped how i build.",
      workExperience: [
        {
          title: "Software Developer",
          company: "NeurotechUoft",
          duration: "Jun 2025 - Present",
          description: "built website and internal tools for a research club at the university of toronto that focuses on neurotechnology research",
          link: "https://neurotechuoft.ca/",
          imageSrc: "/experiences/neurotechuoft.png",
          technologies: "nextjs, typescript"
        },
        {
          title: "President",
          company: "Glenforest Computer Science Club",
          duration: "Sept 2024 - Jun 2026",
          description: "wrote and managed region wide programming contests (gfsshc25!) and organized events for my high school computer science club. led competitive programming and html workshops working with hackclub, & managing finances",
          link: "https://github.com/glenforestss",
          imageSrc: "/experiences/gfsscsclub.png",
          technologies: "Leadership, Collaboration, Teamwork"
        },
        {
          title: "Vice President",
          company: "FutureMD",
          duration: "Jun 2024 - Apr 2026",
          description: "coded website for a healthcare nonprofit that provides free healthcare to teens intreseted in medicine. found sponsors and organized a workshop event through seo and socialmedia marketing",
          link: "https://futuremd.net/",
          imageSrc: "/experiences/futuremd.png",
          technologies: "nextjs, typescript"
        },
        {
          title: "Team Lead",
          company: "VEX Robotics 31331",
          duration: "May 2024 - Apr 2026",
          description: "led my schools robotics team to a provincial championship, building and coding semi autonomous robotics for vex robotics competitions (2025 high stakes & 2026 push back). mentored new members and organized practices.",
          link: "https://github.com/advayc/31331B-VRC-High-Stakes",
          imageSrc: "/experiences/vex.png"
        },
        {
          title: "Media Captain",
          company: "FRC 6070: Gryphon Machine",
          duration: "May 2023 - Apr 2024",
          description: "managed Social Media, coded frc6070.ca website domain expired :( and created promotional material shown to thousands of people. also built semiautonomous robots for the 2023 (charged up) and 2024 (crescendo) frc seasons ",
          link: "https://www.linkedin.com/company/frc-6070-gryphon-machine/",
          imageSrc: "/experiences/frc.webp",
          technologies: "Video Editing, Marketing, nextjs"
        },
      ]
    }
  },
  {
    id: 'projects',
    filename: 'projects.app',
    imageSrc: '/icons/files.png',
    terminalConfig: {
      headerText: "advaychandorkar@personalsite: ~/personal/projects (vim)",
      pathText: "~/personal/projects",
      branchText: "prod ✔",
      infoText: "take a look into some of my projects!",
      projects: [
        {
          title: "Sitemaker",
          description: "Turns a resume into a clean personal site with sections, theme presets, and deploy-ready pages.",
          projectLink: "https://sitemaker.advay.ca/",
          repoUrl: "https://github.com/advayc/sitemaker",
          imageSrc: "/projects/sitemaker.png",
          technologies: "nextjs, typescript",
          markerText: "(resume to website)",
          markerColor: "blue"
        },
        {
          title: "Seva Eats",
          description: "Connects gurdwara meals to families in need with simple listings, requests, and pickup details.",
          projectLink: "https://sevaeats.vercel.app/",
          repoUrl: "https://github.com/Seva-Eats/seva-eats",
          imageSrc: "/projects/seva-eats.png",
          technologies: "react native, typescript"
        },
        {
          title: "Spy",
          description: "i saw that every guess the imposter party game app had adds and low customizability for free users. so i built my own app with no ads, open source code, and a simple interface that allows you to customize the game to your liking. built with react native and typescript and shipped to the appstore in < 1 week",
          projectLink: "https://spy.advay.ca/",
          repoUrl: "https://github.com/advayc/spy",
          imageSrc: "/projects/spy.png",
          technologies: "react native, typeScript"
        },
        {
          title: "GFSS Calendar",
          description: "clubs and students around my school didnt know when other clubs were meeting. so i built a simple full stack calendar app used by the clubs and school admin to present club meetings/events on a simple calendar system. built with a simple nextjs frontend and was used by my school (1k+ mau)",
          projectLink: "https://clubs.advay.ca/",
          repoUrl: "https://github.com/advayc/gfsscalender",
          imageSrc: "/projects/gfss-calendar.png",
          technologies: "nextjs, Typescript",
          markerText: "(1k monthly users)",
          markerColor: "red"
        },
        {
          title: "GQ Planets",
          description: "machine learning tool that classifies possible exoplanets using nasas Kepler, K2, and TESS mission data. used a trained neural network deployed onto a simple web interface. built in PyTorch and trained on merged NASA exoplanet datasets. NASA Space Apps Global Nominee & Most Innovative",
          repoUrl: "https://github.com/DeadUser123/Space-APPS-Hackathon",
          imageSrc: "/projects/gq-planets.png",
          technologies: "machine learning, python",
          markerText: "(won nasa hackathon)",
          markerColor: "yellow"
        },
     {
          title: "miway leaderboard",
          description: "Tracks MiWay bus speeds live using Mississauga's realtime API and shows a ranked feed.",
          projectLink: "https://miway.advay.ca/",
          repoUrl: "https://github.com/advayc/miway-leaderboard",
          imageSrc: "/projects/miway-leaderboard.png",
          technologies: "postman, typescript"
        },
        {
          title: "nums",
          description: "Tiny Go service for counting page views with a clean JSON API and badge output.",
          projectLink: "https://docs.advay.ca/",
          repoUrl: "https://github.com/advayc/nums",
          imageSrc: "/projects/nums.png",
          technologies: "golang"
        },
      ]
    }
  },
  {
    id: 'internet',
    filename: 'internet.exe',
    imageSrc: '/icons/internet.png',
    terminalConfig: {
      headerText: "advaychandorkar@personalsite: ~/personal/internet (goodie)",
      pathText: "~/personal/internet",
      branchText: "main ✔",
      infoText: "browse the internet like it's 1999!"
    }
  },
  {
    id: 'draw',
    filename: 'draw.exe',
    imageSrc: '/icons/draw.png',
    terminalConfig: {
      headerText: "advaychandorkar@personalsite: ~/personal/draw (vim)",
      pathText: "~/personal/draw",
      branchText: "main ✔",
      infoText: "create something cool!"
    }
  }
];
