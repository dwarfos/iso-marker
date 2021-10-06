class FileProgress {
  __fileSize = null;
  bytesInPercent = null;
  bytesChecked = null;
  lastPercent = null;
  updateCall = null;

  constructor(updateCall = () => {}) {
    this.updateCall = updateCall;
    this.updateCall(0);

    this.__fileSize = -1;
    this.bytesInPercent = -1;
    this.bytesChecked = 0;
    this.lastPercent = 0;
  }

  set fileSize(__fileSize) {
    this.__fileSize = __fileSize;
    this.bytesInPercent = Math.round(this.__fileSize / 100);
  }

  update(chunk) {
    this.bytesChecked += chunk.length;
    const percents =
      (this.bytesChecked - (this.bytesChecked % this.bytesInPercent)) /
      this.bytesInPercent;
    if (this.lastPercent != percents) this.updateCall(percents);
    this.lastPercent = percents;
  }
}

export { FileProgress };
