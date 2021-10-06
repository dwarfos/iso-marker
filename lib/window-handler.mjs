import { Downloader } from "./downloader.mjs";
import { OffsetHandler } from "./offset-handler.mjs";
import { FileProgress } from "./file-progress.mjs";

class WindowHandler {
  static progressBarCall = (percents) =>
    (window.document.querySelector("#progress-bar").style.width =
      percents + "%");

  static loadingProgressCall = (percents) => {
    window.document.querySelector("#progress-status").innerHTML =
      "Searching for File Offset...";
    this.progressBarCall(percents);
  };

  static downloadingProgressCall = (percents) => {
    window.document.querySelector(
      "#progress-status"
    ).innerHTML = `Downloading ISO... ${percents}%`;
    this.progressBarCall(percents);
  };

  offsetHandler = null;
  filePath = null;

  // constructor() {}

  get download() {
    return new Downloader(
      new FileProgress(this.constructor.downloadingProgressCall)
    ).download(this.filePath);
  }

  get account() {
    this.offsetHandler = new OffsetHandler(
      new FileProgress(this.constructor.loadingProgressCall)
    );
    return this.offsetHandler.offsetSearch(this.filePath);
  }

  get accountOffset() {
    return this.offsetHandler.offsetMark;
  }

  set account(newAccount) {
    this.offsetHandler.account = newAccount;
  }
}

export { WindowHandler };
