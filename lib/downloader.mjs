const https = require("https");
const fs = require("fs");

class Downloader {
  static source = {
    hostname: "dwarfos.com",
    port: 443,
    path: "/downloads/dwarfos.iso",
    method: "GET",
  };

  fileProgress = null;

  constructor(fileProgress) {
    this.fileProgress = fileProgress;
  }

  static downloadPromise(filePath, fileProgress) {
    return new Promise((success, failure) => {
      if (!filePath) failure("filePath undefined");
      if (!fileProgress) failure("fileProgress undefined");
      https
        .get(this.source, (res) => {
          fileProgress.fileSize = res.headers["content-length"];
          res.pipe(fs.createWriteStream(filePath));
          res.on("data", (chunk) => fileProgress.update(chunk));
          res.on("end", () => success(filePath));
        })
        .on("error", (e) => failure(e));
    });
  }

  async download(filePath) {
    return await this.constructor.downloadPromise(filePath, this.fileProgress);
  }
}

export { Downloader };
