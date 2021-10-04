import { Downloader } from "./downloader.mjs";
import { OffsetHandler } from "./offset-handler.mjs";

class FileHandler {
  offsetHandler = null;
  downloader = null;

  constructor(filePath = null, Progress = null) {
    this.downloader = new Downloader(filePath, Progress);
    this.offsetHandler = new OffsetHandler(filePath, Progress);
  }
  get download() {
    return this.downloader.download();
  }

  get accountFound() {
    return this.offsetHandler.offsetSearch();
  }

  get accountOffset() {
    return this.offsetHandler.accountOffset;
  }

  set account(newAccount = null) {
    this.offsetHandler.account = newAccount;
  }
}

export { FileHandler };
