const requiredMajorVersion = 24;
const currentMajorVersion = Number.parseInt(process.versions.node, 10);

if (currentMajorVersion === requiredMajorVersion) {
  process.exit(0);
}

console.error(
  [
    `This project requires Node.js ${requiredMajorVersion}.x; detected ${process.version}.`,
    "Switch to the pinned runtime with `fnm use` or `nvm use`, then retry the command.",
    "The pinned version is recorded in .node-version and .nvmrc.",
  ].join("\n"),
);
process.exit(1);
