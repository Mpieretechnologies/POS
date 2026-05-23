/** Inline script — suppresses dev-overlay noise from browser extensions (e.g. Loom). */
export const extensionErrorGuardScript = `
(function () {
  var EXTENSION_RE = /(?:chrome|moz|safari)-extension:\\/\\//i;

  var isExtensionSource = function (value) {
    if (!value) return false;
    return EXTENSION_RE.test(String(value));
  };

  var isExtensionError = function (error) {
    if (!error) return false;
    if (isExtensionSource(error.stack)) return true;
    if (isExtensionSource(error.message)) return true;
    if (error.cause && isExtensionError(error.cause)) return true;
    return false;
  };

  var shouldSuppress = function (event) {
    if (isExtensionSource(event.filename)) return true;
    if (event.error && isExtensionError(event.error)) return true;
    if (
      event.message &&
      /Minified React error #\\d+/.test(event.message) &&
      event.error &&
      isExtensionError(event.error)
    ) {
      return true;
    }
    return false;
  };

  var suppressEvent = function (event) {
    event.preventDefault();
    event.stopImmediatePropagation();
  };

  window.addEventListener(
    "error",
    function (event) {
      if (shouldSuppress(event)) {
        suppressEvent(event);
      }
    },
    true,
  );

  window.addEventListener(
    "unhandledrejection",
    function (event) {
      var reason = event.reason;
      if (isExtensionError(reason)) {
        suppressEvent(event);
        return;
      }
      var stack = reason && reason.stack ? reason.stack : String(reason);
      if (isExtensionSource(stack)) {
        suppressEvent(event);
      }
    },
    true,
  );

  if (typeof window.reportError === "function") {
    var nativeReportError = window.reportError.bind(window);
    window.reportError = function (error) {
      if (isExtensionError(error)) return;
      nativeReportError(error);
    };
  }
})();
`.trim();
