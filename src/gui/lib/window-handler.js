const { OffsetHandler } = require("../../cli/lib/offset-handler.js");
const { Downloader } = require("../../cli/lib/downloader.js");

class WindowHandler {
  mainWindow = null;
  offsetHandler = null;
  __filePath = null;
  loadingStatus = null;
  onDownloadProgress = null;
  onFilePath = null;

  constructor(mainWindow) {
    this.mainWindow = mainWindow;
  }

  get filePath() {
    return this.__filePath;
  }

  set filePath(filePath) {
    this.__filePath = filePath;
    this.onFilePath(this.filePath);
  }

  get download() {
    return Downloader.downloadResolve(this.filePath, this.onDownloadProgress);
  }

  get offset() {
    this.loadingStatus();
    const offsetResults = OffsetHandler.offsetResolve(this.filePath);
    return offsetResults;
  }

  onOffset(filePath, offset) {
    this.offsetHandler = new OffsetHandler(filePath, offset);
  }

  set account(newAccount) {
    this.offsetHandler.account = newAccount;
  }
}

module.exports = { WindowHandler };
