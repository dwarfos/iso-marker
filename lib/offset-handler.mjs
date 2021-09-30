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

  static offsetWrite(filePath = null, accountOffset = null, newAccount = null) {
    if (!filePath || !accountOffset) return;
    let bufferCharArray = [];
    const accountCharArray = newAccount.split("");
    let nlPos;
    for (let charPos = 0; charPos < 24; charPos++) {
      if (accountCharArray[charPos] !== undefined) {
        bufferCharArray.push(accountCharArray[charPos]);
        continue;
      }
      if (nlPos === undefined) {
        nlPos = charPos;
        bufferCharArray.push("\n");
        continue;
      }
      bufferCharArray.push("0");
    }
    const bufferAccount = bufferCharArray.join("");
    const buf = new Buffer.from(bufferAccount, ["latin1"]);
    const write = fs.openSync(filePath, "r+");
    fs.writeSync(write, buf, 0, buf.length, accountOffset);
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

  set account(newAccount = null) {
    if (!newAccount) return;
    this.constructor.offsetWrite(this.filePath, this.accountOffset, newAccount);
  }
}

export { OffsetHandler };
