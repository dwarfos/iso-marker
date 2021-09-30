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

  set selectedFile(filePath = null) {
    this.fileHandler = new FileHandler(filePath, this.Progress);
  }

  set account(newAccount = null) {
    this.fileHandler.account = newAccount;
  }
}

export { WindowHandler };
