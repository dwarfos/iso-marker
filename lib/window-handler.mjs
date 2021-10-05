import { FileHandler } from "./file-handler.mjs";
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

  fileHandler = null;

  constructor() {
    this.fileHandler = new FileHandler();
  }

  static newInstance(filePath = null) {
    return new this(filePath);
  }

  get download() {
    return this.fileHandler.download;
  }

  get accountFound() {
    return this.fileHandler.accountFound;
  }

  get accountOffset() {
    return this.fileHandler.accountOffset;
  }

  set selectedPath(filePath = null) {
    this.fileHandler = new FileHandler(
      filePath,
      FileProgress,
      this.constructor.loadingProgressCall,
      this.constructor.downloadingProgressCall
    );
  }

  set account(newAccount = null) {
    return (this.fileHandler.account = newAccount);
  }
}

export { WindowHandler };
