const https = require("https");
const fs = require("fs");

class Downloader {
  static source = {
    hostname: "dwarfos.com",
    port: 443,
    path: "/downloads/dwarfos.iso",
    method: "GET",
  };

  static get progressClass() {
    return class {
      static bytesInPercent = (fileSize) => Math.round(fileSize / 100);

      static percents = (bytesDone, bytesInPercent) =>
        (bytesDone - (bytesDone % bytesInPercent)) / bytesInPercent;

      bytesDone = null;
      bytesInPercent = null;
      lastPercent = null;
      onUpdate = null;

      constructor(onUpdate) {
        onUpdate(0);
        this.onUpdate = onUpdate;
        this.bytesDone = 0;
        this.bytesInPercent = -1;
        this.lastPercent = 0;
      }

      set fileSize(size) {
        this.bytesInPercent = this.constructor.bytesInPercent(size);
      }

      set data(bytesDone) {
        this.bytesDone += bytesDone;
        const percents = this.constructor.percents(
          this.bytesDone,
          this.bytesInPercent
        );
        if (this.lastPercent != percents) this.onUpdate(percents);
        this.lastPercent = percents;
      }
    };
  }

  static downloadPromise = (filePath, onUpdate) => {
    return new Promise((success, failure) => {
      if (!filePath) failure("filePath undefined");
      let progress = {};
      if (onUpdate) progress = new this.progressClass(onUpdate);
      https
        .get(this.source, (res) => {
          if (onUpdate) progress.fileSize = res.headers["content-length"];
          res.pipe(fs.createWriteStream(filePath));
          res.on("data", (chunk) => (progress.data = chunk.length));
          res.on("end", () => success({ filePath: filePath }));
        })
        .on("error", (e) => failure(e));
    });
  };

  static downloadResolve = async (filePath, onProgress) =>
    await this.downloadPromise(filePath, onProgress);
}

module.exports = { Downloader };
