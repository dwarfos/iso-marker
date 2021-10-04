const https = require("https");
const fs = require("fs");

const options = {
  hostname: "dwarfos.com",
  port: 443,
  path: "/downloads/dwarfos.iso",
  method: "GET",
  agent: false,
};

class Downloader {
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
  Progress = this.constructor.Progress;

  constructor(filePath = null, Progress = this.constructor.Progress) {
    this.filePath = filePath;
    this.Progress = Progress;
  }

  static download(filePath = null, Progress = this.Progress) {
    return new Promise((success, failure) => {
      https
        .get(options, (res) => {
          const progress = new Progress(res.headers["content-length"], true);
          res.pipe(fs.createWriteStream(filePath));
          res.on("data", (chunk) => progress.update(chunk));
          res.on("end", () => success(filePath));
        })
        .on("error", (e) => failure(e));
    });
  }

  async download() {
    return await this.constructor.download(this.filePath, this.Progress);
  }
}

export { Downloader };
