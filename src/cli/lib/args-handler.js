const arg = require("arg");

class ArgsHandler {
  static spec = {
    // Types
    "--help": Boolean,
    "--input": [String],
    "--output": [String],
    "--account": [String],

    // Aliases
    "--acc": "--account",
    "-a": "--acc",
    "-i": "--input",
    "-o": "--output",
    "-h": "--help",
  };

  static help = {
    notes: [
      "You can't check and download to multiple file paths!",
      "You can't check file path and download to another file path simultaneously!",
      "Duplicate cli inputs will show this help!",
    ],
    uses: {
      "--input": "Filepath to check (& set).",
      "--output": "Download to filepath (& set).",
      "--account": "Account to set to.",
      "--help": "Show this help.",
    },
    examples: [
      "npm run cli -- -h",
      "node src/cli/index.js -h",
      "node src/cli/index.js -o path/to/file",
      "npm run cli -- -i path/to/file",
      "npm run cli -- -i path/to/file -a accountID",
      "npm run cli -- -o path/to/file -a accountID",
    ],
    spec: this.spec,
  };

  static getArgs(argv) {
    return arg(this.spec, (this.options = { permissive: true, argv: argv }));
  }

  static checkDupe(argArray) {
    if (!argArray) return false;
    if (argArray.length > 1) return true;
  }

  args = null; // filtered args
  output = null; // filePath where to download
  input = null; // filePath to read for offset
  account = null; // used for setAccount
  help = null; // help trigger

  constructor(argv = process.argv.slice(2)) {
    // check if empty
    if (argv.length === 0) {
      this.help = true;
      return;
    }

    // sort argv to args
    this.args = this.constructor.getArgs(argv);

    // check for help / errors
    if (this.args["_"].length > 0 || this.args["--help"]) {
      this.help = true;
      return;
    }

    // set handler's vars
    [this.output, this.input, this.account] = [
      this.args["--output"],
      this.args["--input"],
      this.args["--account"],
    ];

    // check for dupes
    if (
      this.constructor.checkDupe(this.output) ||
      this.constructor.checkDupe(this.input) ||
      this.constructor.checkDupe(this.account)
    ) {
      this.help = true;
      return;
    }

    // check if filePath for processing is missing
    // check for input(check/set)+output(download/set) conflict
    if ((!this.input && !this.output) || (this.input && this.output)) {
      this.help = true;
      return;
    }

    // console.log("Query nice and sound!");
  }

  execQuery() {
    //
    // console.log("Done!");
  }
}

module.exports = { ArgsHandler };
