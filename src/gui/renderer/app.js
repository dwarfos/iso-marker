class RendererApp {
  static handleOpenFile = async (promise, resolved, failed) => {
    promise.then((result) => {
      if (result.canceled) return;
      if (typeof result === "string") return failed(result);
      return resolved(result);
    });
  };

  static handleSetAccount = async (promise, resolved) => {
    promise.then((result) => {
      return resolved(result);
    });
  };

  static handleSaveFile = async (promise, resolved) => {
    promise.then((result) => {
      if (result.canceled) return;
      return resolved(result);
    });
  };
}

module.exports = { RendererApp };
