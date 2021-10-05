class FileProgress {
  static callFunc = (arg) => arg;

  fileSize = null;
  bytesInPercent = null;
  bytesChecked = null;
  lastPercent = null;
  updateCall = this.constructor.callFunc;

  constructor(fileSize = null, updateCall = this.constructor.callFunc) {
    this.fileSize = fileSize;
    this.bytesInPercent = Math.round(fileSize / 100);
    this.bytesChecked = 0;
    this.lastPercent = 0;
    this.updateCall = updateCall;
    this.updateCall(0);
  }

  update(chunk = null) {
    this.bytesChecked += chunk.length;
    const percents =
      (this.bytesChecked - (this.bytesChecked % this.bytesInPercent)) /
      this.bytesInPercent;
    if (this.lastPercent != percents) this.updateCall(percents);
    this.lastPercent = percents;
  }
}

export { FileProgress };
