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
          description: "wrote contests and organized events for my high school computer science club. led competitive programming and html workshops working with hackclub, & managing finances",
          link: "https://github.com/GFSSCompSci/",
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
          description: "led my schools robotics team to a provincial championship, building and coding semi autonomous robotics for vex robotics competitions. mentored new members and organized practices.",
          link: "https://github.com/advayc/31331B-VRC-High-Stakes",
          imageSrc: "/experiences/vex.png"
        },
        {
          title: "Media Captain",
          company: "FRC 6070: Gryphon Machine",
          duration: "May 2023 - Apr 2024 · 1 yr",
          description: "managed Social Media, frc6070.ca and created promotional material shown to thousands of people.",
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
          description: "Social deduction party game for iOS, Android, and web with Classic Spy and Range Game modes.",
          projectLink: "https://spy.advay.ca/",
          repoUrl: "https://github.com/advayc/spy",
          imageSrc: "/projects/spy.png",
          technologies: "react native, typeScript"
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
          title: "GFSS Calendar",
          description: "Full-stack calendar for club events with admin posting and student-friendly views.",
          projectLink: "https://clubs.advay.ca/",
          repoUrl: "https://github.com/advayc/gfsscalender",
          imageSrc: "/projects/gfss-calendar.png",
          technologies: "nextjs, Typescript",
          markerText: "(1k monthly users)",
          markerColor: "red"
        },
        {
          title: "nums",
          description: "Tiny Go service for counting page views with a clean JSON API and badge output.",
          projectLink: "https://docs.advay.ca/",
          repoUrl: "https://github.com/advayc/nums",
          imageSrc: "/projects/nums.png",
          technologies: "golang"
        },
        {
          title: "GQ Planets",
          description: "NASA hackathon project visualizing exoplanet data with interactive exploration tools.",
          repoUrl: "https://github.com/advayc/Biped",
          imageSrc: "/projects/gq-planets.png",
          technologies: "Arduino, C++, electronics",
          markerText: "(won nasa hackathon)",
          markerColor: "yellow"
        }
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
