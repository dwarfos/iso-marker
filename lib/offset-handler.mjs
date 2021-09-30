const fs = require("fs");

class OffsetHandler {
  static Progress = class {
    bytesChecked = null;
    constructor() {
      this.bytesChecked = 0;
    }
    update(chunk) {
      this.bytesChecked += chunk.length;
    }
  };

  filePath = null;
  accountOffset = null;
  Progress = this.constructor.Progress;

  constructor(filePath = null, Progress = this.constructor.Progress) {
    this.filePath = filePath;
    this.Progress = Progress;
  }

  static offsetPromise(filePath = null, Progress = this.Progress) {
    return new Promise((success, failure) => {
      if (!filePath) failure("filePath === null");
      let offsetFound = {};
      const progress = new Progress(fs.statSync(filePath).size);
      const readInterface = fs.createReadStream(filePath, {
        highWaterMark: 1048576,
        encoding: "latin1",
      });
      readInterface.on("data", (chunk) => {
        progress.update(chunk);
        const search = chunk.search("dwaccount=");
        if (search === -1) return;
        offsetFound = {
          mark: progress.bytesChecked - chunk.length + search + 10,
          account: chunk.substring(search + 10, search + 32).split("\n")[0],
        };
        readInterface.destroy();
        success(offsetFound);
      });
      readInterface.on("close", () => {
        if (offsetFound.mark) return;
        failure("offsetFound.mark === undefined");
      });
    });
  }

  async offsetSearch(Progress = this.Progress) {
    if (!this.filePath) return;
    const offsetFound = await this.constructor.offsetPromise(
      this.filePath,
      Progress
    );
    this.accountOffset = offsetFound.mark;
    return offsetFound.account;
  }
}

export { OffsetHandler };
