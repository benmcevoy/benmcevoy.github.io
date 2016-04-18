(function (global) {
    if (!jsf.exists(window.console)) { window.console = { log: function () { return true; } }; };
    if (jsf.exists(window.console)) { if (!jsf.options.debug) window.console.log = function () { return true; }; };
})();