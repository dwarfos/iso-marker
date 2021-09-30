// skip
const https = require("https");
const fs = require("fs");

class Downloader {
  static source = {
    hostname: "dwarfos.com",
    port: 443,
    path: "/downloads/dwarfos.iso",
    method: "GET",
  };

  filePath = null;

  constructor(filePath = null) {
    this.filePath = filePath;
  }

  static download(filePath) {
    https
      .get(this.source, (res) => res.pipe(fs.createWriteStream(filePath)))
      .on("error", (e) => console.error(e));
  }

  download() {
    this.constructor.download(this.filePath);
  }
}

export { Downloader };
