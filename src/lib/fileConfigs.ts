export const fileConfigs = [
  {
    id: 'learn',
    filename: 'learn.exe',
    imageSrc: '/computer.png',
    terminalConfig: {
      headerText: "advaychandorkar@personalsite: ~/personal/about (zsh)",
      pathText: "~/personal/about",
      branchText: "master ✔",
      infoText: "my name is advay, i'm a grade 11 student and I have a passion for engineering and problem solving. i like to ride bikes, play badminton, and tinker on projects that involve web development, 3D printing, electronics, and design."
    }
  },
  {
    id: 'projects',
    filename: 'projects.app',
    imageSrc: '/files.png',
    terminalConfig: {
      headerText: "advaychandorkar@personalsite: ~/personal/projects (zsh)",
      pathText: "~/personal/projects",
      branchText: "prod ✔",
      infoText: "take a look into some of my projects!",
      projects: [
        {
          title: "FutureMD Website",
          description: "Website for A youth-led nonprofit organization with the goal to educate teens about life during and after medical school!",
          repoUrl: "https://github.com/advayc/futuremd-site",
          technologies: "NextJS, Typescript, Tailwind CSS"
        },
        {
          title: "Graph Visualizer",
          description: "Python functions to visualize weighted and unweighted graphs and paths using Matplotlib and Networkx libraries.",
          repoUrl: "https://github.com/advayc/graph-visualizer",
          technologies: "Python, Matplotlib, Networkx"
        },
        {
          title: "Chatify",
          description: "Chatify! A tool to communicate with family, friends, and communities online. Paired with great features like End-To-End encryption, and customizability!",
          repoUrl: "https://github.com/Abdifatah-Abdi/Chatify-Old",
          technologies: "Javascript, NodeJS, Socket.io"
        },
        {
          title: "LCD Calculator",
          description: "ATMEGA 324PA microcontroller-based calculator with LCD display and ADC input.",
          repoUrl: "https://github.com/advayc/calculator",
          technologies: "Arduino, C++, electronics"
        },
        {
          title: "Rhymebot",
          description: "Elevate your writing with the ultimate rhyming, synonym, and antonym companion. Craft masterpieces anytime, anywhere with ease.",
          repoUrl: "https://github.com/advayc/rhymebot",
          technologies: "Javascript, HTML, CSS"
        },
        {
          title: "Humanoid Robot",
          description: "Walking and dancing humanoid robot using 7 servo motors and custom Arduino nano board.",
          repoUrl: "https://github.com/advayc/Biped",
          technologies: "Arduino, C++, electronics"
        }
      ]
    }
  }
];