const { ArgsHandler } = require("./lib/args-handler.js");

class Main {
  argsHandler = null;

  constructor(argv = process.argv.slice(2)) {
    this.argsHandler = new ArgsHandler(argv);

    // check if help was triggered
    if (this.argsHandler.help === true) {
      console.log(ArgsHandler.help);
      return;
    }

    // all is well, execute the cli query
    this.argsHandler.execQuery();
  }
}

// console.log(new Main().argsHandler);

new Main();
