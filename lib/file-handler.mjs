import { Downloader } from "./downloader.mjs";
// import { FileProgress } from "./file-progress.mjs";
import { OffsetHandler } from "./offset-handler.mjs";

class FileHandler {
  offsetHandler = null;
  downloader = null;

  constructor(filePath = null, Progress = null) {
    this.downloader = new Downloader(filePath);
    this.offsetHandler = new OffsetHandler(filePath, Progress);
  }

  get accountFound() {
    return this.offsetHandler.offsetSearch();
  }

  get accountOffset() {
    return this.offsetHandler.accountOffset;
  }

  /**
     * @param {any} filePath
     */
  set selectedFile(filePath) {
    this.constructor(filePath, this.offsetHandler.Progress);
  }
}

export { FileHandler };
