const https = require("https");
const fs = require("fs");

class Downloader {
  static source = {
    hostname: "dwarfos.com",
    port: 443,
    path: "/downloads/dwarfos.iso",
    method: "GET",
  };

  static FileProgress = class {
    bytesChecked = null;

    constructor() {
      this.bytesChecked = 0;
    }

    update(chunk) {
      this.bytesChecked += chunk.length;
    }
  };

  filePath = null;
  FileProgress = this.constructor.FileProgress;
  fileProgressCall = null;

  constructor(
    filePath = null,
    FileProgress = this.constructor.FileProgress,
    fileProgressCall = null
  ) {
    this.filePath = filePath;
    this.FileProgress = FileProgress;
    this.fileProgressCall = fileProgressCall;
  }

  static download(
    filePath = null,
    FileProgress = this.FileProgress,
    fileProgressCall = null
  ) {
    return new Promise((success, failure) => {
      https
        .get(this.source, (res) => {
          const fileProgress = new FileProgress(
            res.headers["content-length"],
            fileProgressCall
          );
          res.pipe(fs.createWriteStream(filePath));
          res.on("data", (chunk) => fileProgress.update(chunk));
          res.on("end", () => success(filePath));
        })
        .on("error", (e) => failure(e));
    });
  }

  async download() {
    return await this.constructor.download(
      this.filePath,
      this.FileProgress,
      this.fileProgressCall
    );
  }
}

export { Downloader };
