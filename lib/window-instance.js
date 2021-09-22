const Downloader = require("./downloader");
//import FileProgress from './file-progress.js'; <-- end ver?
const OffsetWriter = require("./offset-writter");

class WindowInstance {
  progress = null;
  downloader = null;
  filePath = null;
  constructor(filePath) {
    this.filePath = filePath;
    this.downloader = new Downloader(this.filePath);
    //this.progress = new FileProgress();
    this.offsetWriter = new OffsetWriter(this.filePath);
  }
  startDownload() {
    this.downloader.download();
  }
  checkAccount() {
    const offset = this.offsetWriter.readAccount(this.filePath);
    return offset;
  }
}

module.exports = WindowInstance;
