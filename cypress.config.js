const fs = require("fs");
const path = require("path");

module.exports = {
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
      on("task", {
        readDirectory(directoryPath) {
          const fileNames = fs.readdirSync(directoryPath);
          return fileNames.filter((file) => file.endsWith(".json"));
        },
        CheckIfDirectoryEmpty(directoryPath) {
          return fs.readdirSync(directoryPath).length === 0;
        },

        readFile(filePath) {
          const fullPath = path.resolve(filePath);
          return fs.promises.readFile(fullPath, "utf-8");
        },
      });
    },
  },
};
