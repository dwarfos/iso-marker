import { Downloader } from "./downloader.mjs";
// import { FileProgress } from "./file-progress.mjs";
import { OffsetHandler } from "./offset-handler.mjs";

class FileHandler {
  offsetHandler = null;
  downloader = null;
  filePath = null;

  constructor(filePath) {
    this.filePath = filePath;
    this.downloader = new Downloader(this.filePath);
    this.offsetHandler = new OffsetHandler(this.filePath);
  }

  startDownload() {
    // this.downloader.download();
  }

  get accountFound() {
    return this.offsetHandler.offsetSearch();
  }

  get accountOffset() {
    return this.offsetHandler.accountOffset;
  }
}

export { FileHandler };
