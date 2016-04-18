var jsf = (function () {
    "use strict";

    var _jqueryCDNUrl = "js/jquery/jquery.js";
    var _templateCDNUrl = "js/jquery/jquery.tmpl.min.js";
    var _jgrowlUrl = "js/jquery/jquery.jgrowl.min.js";
    var _jgrowlCSSUrl = "js/jquery/jquery.jgrowl.css";
    var _consoleUrl = "js/console.js";
    var _errorUrl = "js/error.js";
    var _stringUrl = "js/prototype/string.js";

    var options = {
        jquery: true,
        template: true,
        debug: true,
        error: true,
        console: true,
        notify: true
    };

    var init = function (o) {
        options = mergeObject(options, o);

        if (!options.jquery) {
            // if there is no jquery then we cannot do these
            options.notify = false;
            options.template = false;
        }

        loadScript(_stringUrl);
        if (options.jquery) {
            if (typeof($) == "undefined") {
                loadScript(_jqueryCDNUrl);
            }
        }

        if (options.jquery && options.template) {
                loadScript(_templateCDNUrl);
        }

        if (options.jquery && options.notify) {
                loadCSS(_jgrowlCSSUrl);
                loadScript(_jgrowlUrl);
        }

        if (options.console) loadScript(_consoleUrl);
        if (options.error) loadScript(_errorUrl);
    };

    var mergeObject = function (target, source) {
        if (exists(source)) {
            for (var property in target) {
                if (property in source) {
                    target[property] = source[property];
                }
            }
        }
        return target;
    };

    var exists = function (obj) {
        if (typeof obj == "undefined") return false;
        return obj != null && obj != undefined && obj != "undefined";
    };

    var loadScript = function (url) { document.write("<scri" + "pt src=\"" + url + "\" type=\"text/javascript\"></sc" + "ript>"); };
    var loadCSS = function (url) { document.write("<li" + "nk href=\"" + url + "\" rel=\"stylesheet\" type=\"text/css\" />"); };

    /// wait until() condition is true then complete()
    /// until() is reevaluated every interval or timeout has elapsed
    var wait = function (until, complete, interval, timeout, error) {
        if (!exists(interval)) interval = 100; // set default
        if (!exists(timeout)) timeout = 2000; // set default
        timeout -= interval;
        if (timeout < 0) {
            if (error) error();
            else throw new Error("wait timeout expired!", until);
            return;
        }
        if (!until()) {
            console.log("wait until ", timeout);
            window.setTimeout(wait(until, complete, interval, timeout, error), interval);
        } else {
            console.log("complete");
            if (exists(complete)) complete();
        }
    };

    return {
        wait: wait,
        init: init,
        options: options,
        loadScript: loadScript,
        loadCSS: loadCSS,
        exists: exists,
        mergeObject: mergeObject
    };

} ());

jsf.init();

