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
      infoText: "heres a look into some of my projects!",
      projects: [
        {
          title: "Graph Visualizer",
          description: "Python functions to visualize unweighted graphs and paths using Matplotlib and Networkx libraries.",
          repoUrl: "https://github.com/advayc/graph-visualizer"
        },
        {
          title: "LCD Calculator",
          description: "ATMEGA 324PA microcontroller-based calculator with LCD display and ADC input.",
          repoUrl: "https://github.com/advayc/calculator"
        },
        {
          title: "Humanoid Robot",
          description: "Walking and dancing humanoid robot using 7 servo motors and custom Arduino nano board.",
          repoUrl: "https://github.com/advayc/Biped"
        }
      ]
    }
  }
];