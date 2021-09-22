const fs = require("fs");

class OffsetWriter {
  filePath = null;
  accountOffset = null;
  callback = null;
  progress = null;
  done = null;

  constructor(filePath) {
    if (filePath) this.filePath = filePath;
    this.callback = function (arg) {
      return arg;
    };
    this.progress = class {
      bytesChecked = null;
      constructor() {
        this.bytesChecked = 0;
      }
      update(chunk) {
        this.bytesChecked += chunk.length;
      }
    };
    this.done = this.callback;
  }
  onProgress(callback) {
    if (!callback) return this.progress;
    this.progress = class {
      bytesChecked = null;
      constructor() {
        this.bytesChecked = 0;
      }
      update(chunk) {
        this.bytesChecked += chunk.length;
        callback(chunk);
      }
    };
  }
  onDone(callback) {
    if (!callback) return this.done;
    this.done = callback;
  }
  //filepath
  readAccount() {
    const progress = new this.progress();
    const done = this.done;
    const filePath = this.filePath;
    let accountOffset = null;
    let accountFound;
    const size = fs.statSync(filePath).size;
    //const progress = new FileProgress(size);
    const readInterface = fs.createReadStream(filePath, {
      highWaterMark: 1048576,
      encoding: "latin1",
    });
    readInterface.on("data", (chunk) => {
      progress.update(chunk);
      const search = chunk.search("dwaccount=");
      if (search === -1) return;
      const accountChunk = chunk
        .substring(search + 10, search + 32)
        .split("\n")[0];
      accountFound =
        accountChunk == "0000000000000000000000" ? "" : accountChunk;
      accountOffset = progress.bytesChecked - chunk.length + search + 10;
      readInterface.destroy();
      console.log(accountOffset.toString(16));
      console.log(accountFound);
      //onFileOffsetFound(accountFound);
    });
    readInterface.on("close", () => done);
  }
}

module.exports = OffsetWriter;
