import { FileHandler } from "./file-handler.mjs";
import { Progress } from "./file-progress.mjs";

class WindowHandler {
  fileHandler = null;
  Progress = null;

  constructor(filePath = null) {
    this.Progress = Progress;
    this.fileHandler = new FileHandler(filePath, this.Progress);
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
    this.fileHandler = new FileHandler(filePath, this.Progress);
  }

  set account(newAccount = null) {
    this.fileHandler.account = newAccount;
  }
}

export { WindowHandler };
