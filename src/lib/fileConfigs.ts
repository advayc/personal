export const fileConfigs = [
  {
    id: 'experience',
    filename: 'experience.exe',
    imageSrc: '/icons/computer.png',
    terminalConfig: {
      headerText: "advaychandorkar@personalsite: ~/personal/about (vim)",
      pathText: "~/personal/about",
      branchText: "master ✔",
      infoText: "i like to ride bikes, play badminton, and tinker on projects that involve web development, 3D printing, electronics, and design.",
      workExperience: [
        {
          title: "Software Developer",
          company: "NeurotechUoft",
          duration: "Jun 2025 - Present",
          description: "built website and internal tools for a research club at the university of toronto that focuses on neurotechnology research",
          link: "https://neurotechuoft.ca/",
          imageSrc: "/experiences/neurotech.png",
          technologies: "nextjs, typescript"
        },
        {
          title: "President",
          company: "Glenforest Computer Science Club",
          duration: "Sept 2024 - June 2025 · 1 yr",
          description: "wrote contests and organized events for my high school computer science club. led competitive programming and html workshops working with hackclub, & managing finances",
          link: "https://github.com/GFSSCompSci/",
          imageSrc: "/experiences/cs-club.png",
          technologies: "Leadership, Collaboration, Teamwork"
        },
        {
          title: "Lead Web Developer",
          company: "FutureMD",
          duration: "Jun 2024 - June 2025 · 1 yr",
          description: "coded website for a healthcare nonprofit that provides free healthcare to teens intreseted in medicine. found sponsors and organized a workshop event through seo and socialmedia marketing",
          link: "https://futuremd.net/",
          imageSrc: "/experiences/neurotech.png",
          technologies: "nextjs, typescript"
        },
        {
          title: "Team Lead",
          company: "VEX Robotics",
          duration: "May 2024 - June 2025 · 1 yr",
          description: "led my schools robotics team to a provincial championship, building and coding semi autonomous robotics for vex robotics competitions. mentored new members and organized practices.",
          link: "https://github.com/advayc/31331B-VRC-High-Stakes",
          imageSrc: "/experiences/vex-robotics.jpeg"
        },
        {
          title: "Media Captain",
          company: "FRC 6070: Gryphon Machine",
          duration: "May 2023 - Apr 2024 · 1 yr",
          description: "managed Social Media, frc6070.ca and created promotional material shown to thousands of people.",
          link: "https://www.linkedin.com/company/frc-6070-gryphon-machine/",
          imageSrc: "/experiences/frc.png",
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
          description: "app that turns your resume into a full personal website",
          projectLink: "https://sitemaker.advay.ca/",
          repoUrl: "https://github.com/advayc/sitemaker",
          imageSrc: "/projects/sitemaker.png",
          technologies: "nextjs, typescript"
        },
        {
          title: "Seva Eats",
          description: "A platform connecting authentic Gurdwara food to families in need, free of charge",
          projectLink: "https://sevaeats.vercel.app/",
          repoUrl: "https://github.com/Seva-Eats/seva-eats",
          imageSrc: "/projects/seva-eats.png",
          technologies: "react native, typescript"
        },
        {
          title: "Spy",
          description: "Spy is a social deduction party game for iOS, Android, and web. Gather your friends and play two unique modes: Classic Spy and Range Game.",
          projectLink: "https://spy.advay.ca/",
          repoUrl: "https://github.com/advayc/spy",
          imageSrc: "/projects/spy.png",
          technologies: "react native, typeScript"
        },
        {
          title: "miway leaderboard",
          description: "site to track current speeds of miway buses from the mississauga realtime data api",
          projectLink: "https://miway.advay.ca/",
          repoUrl: "https://github.com/advayc/miway-leaderboard",
          imageSrc: "/projects/miway-leaderboard.png",
          technologies: "postman, typescript"
        },
        {
          title: "GFSS Calendar",
          description: "full stack calendar app to display club events/meetings around my school",
          projectLink: "https://clubs.advay.ca/",
          repoUrl: "https://github.com/advayc/gfsscalender",
          imageSrc: "/projects/gfss-calendar.png",
          technologies: "nextjs, Typescript"
        },
        {
          title: "nums",
          description: "Custom Go HTTP API to count website visits",
          projectLink: "https://docs.advay.ca/",
          repoUrl: "https://github.com/advayc/nums",
          imageSrc: "/projects/nums.png",
          technologies: "golang"
        },
        {
          title: "Humanoid Robot",
          description: "Walking and dancing humanoid robot using 7 servo motors and custom Arduino nano board.",
          repoUrl: "https://github.com/advayc/Biped",
          imageSrc: "/projects/gq-planets.png",
          technologies: "Arduino, C++, electronics"
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
