import fs from "fs";

class OffsetHandler {
  static progress = class {
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

  constructor(filePath = null) {
    this.filePath = filePath;
  }

  static offsetPromise(filePath) {
    return new Promise((resolve) => {
      const progress = new this.progress();
      const readInterface = fs.createReadStream(filePath, {
        highWaterMark: 1048576,
        encoding: "latin1",
      });

      readInterface.on("data", (chunk) => {
        progress.update(chunk);

        const search = chunk.search("dwaccount=");
        if (search === -1) return;

        readInterface.destroy();
        const offset = {
          mark: progress.bytesChecked - chunk.length + search + 10,
          account: chunk.substring(search + 10, search + 32).split("\n")[0],
        };

        resolve(offset);
      });
    });
  }

  async offsetSearch() {
    const offset = await this.constructor.offsetPromise(this.filePath);
    this.accountOffset = offset.mark;
    return offset.account;
  }
}

export { OffsetHandler };
