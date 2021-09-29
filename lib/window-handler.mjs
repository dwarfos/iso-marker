import { FileHandler } from "./file-handler.mjs";

class WindowHandler {
  filePath = null;
  fileHandler = null;
  constructor(filePath = null) {
    this.filePath = filePath;
    this.fileHandler = new FileHandler(this.filePath);
  }
  static newInstance(filePath) {
    return new this(filePath);
  }
  get accountFound() {
    return this.fileHandler.accountFound;
  }
  get accountOffset() {
    return this.fileHandler.accountOffset;
  }
}

export { WindowHandler };
