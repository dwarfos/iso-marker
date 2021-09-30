import { FileHandler } from "./file-handler.mjs";

class WindowHandler {
  fileHandler = null;
  Progress = null;

  constructor(filePath = null, Progress = null) {
    this.Progress = Progress;
    this.fileHandler = new FileHandler(filePath, this.Progress);
  }

  static newInstance(filePath = null, Progress = null) {
    return new this(filePath, Progress);
  }

  get accountFound() {
    return this.fileHandler.accountFound;
  }

  get accountOffset() {
    return this.fileHandler.accountOffset;
  }

  /**
   * @param {any} filePath
   */
  set selectedFile(filePath) {
    this.fileHandler = new FileHandler(filePath, this.Progress);
  }
}

export { WindowHandler };
