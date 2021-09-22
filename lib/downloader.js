const https = require("https");
const fs = require("fs");

const options = {
  hostname: "dwarfos.com",
  port: 443,
  path: "/downloads/dwarfos.iso",
  method: "GET",
};

class Downloader {
  source = null;
  filePath = null;
  callback = null;
  progress = null;
  done = null;
  constructor(filePath) {
    if (options) this.source = options;
    if (filePath) this.filePath = filePath;
    this.callback = function (arg) {
      return arg;
    };
    this.progress = this.callback;
    this.done = this.callback;
  }
  onProgress(callback) {
    if (!callback) return this.progress;
    this.progress = callback;
  }
  onDone(callback) {
    if (!callback) return this.done;
    this.done = callback;
  }
  download() {
    const progress = this.progress;
    const done = this.done;
    const filePath = this.filePath;
    const file = fs.createWriteStream(filePath);
    const callback = function (res) {
      //this.fileSize = res.headers["content-length"];
      res.pipe(file);
      res.on("data", progress);
      res.on("end", done);
    };
    https.get(this.source, callback).on("error", (e) => console.error(e));
  }
}

module.exports = Downloader;
