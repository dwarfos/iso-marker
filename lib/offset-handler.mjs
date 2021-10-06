const fs = require("fs");

class OffsetHandler {
  fileProgress = null;
  filePath = null;
  offsetMark = null;

  constructor(fileProgress) {
    this.fileProgress = fileProgress;
  }

  static offsetWrite(filePath, offsetMark, newAccount) {
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
    fs.writeSync(write, buf, 0, buf.length, offsetMark);
  }

  static offsetPromise(filePath, fileProgress) {
    return new Promise((success, failure) => {
      if (!filePath) failure("filePath undefined");
      if (!fileProgress) failure("fileProgress undefined");
      let offset = {};
      fileProgress.fileSize = fs.statSync(filePath).size;
      const readInterface = fs.createReadStream(filePath, {
        highWaterMark: 1048576,
        encoding: "latin1",
      });
      readInterface.on("data", (chunk) => {
        fileProgress.update(chunk);
        const search = chunk.search("dwaccount=");
        if (search === -1) return;
        offset = {
          mark: fileProgress.bytesChecked - chunk.length + search + 10,
          account: chunk.substring(search + 10, search + 32).split("\n")[0],
        };
        readInterface.destroy();
        success(offset);
      });
      readInterface.on("close", () => {
        if (offset.mark) return;
        failure("offsetMark not founnd");
      });
    });
  }

  async offsetSearch(filePath) {
    const offset = await this.constructor.offsetPromise(
      filePath,
      this.fileProgress
    );
    this.filePath = filePath;
    this.offsetMark = offset.mark;
    return offset.account;
  }

  set account(newAccount) {
    this.constructor.offsetWrite(this.filePath, this.offsetMark, newAccount);
  }
}

export { OffsetHandler };
