(function (global) {
    window.onerror = (function (m, u, l) {
        if (jsf.options.debug && jsf.options.notify) $.jGrowl(m + "<br/>" + u + "<br/>line: " + l, { sticky: true });
        console.log("ERROR", arguments);
        return true;
    });

    if (jsf.options.jquery) {
        $().ajaxError(function (e, x, s, t) {
            if (jsf.options.debug && jsf.options.notify) $.jGrowl("ERROR " + s.url + "<br/>" + x.responseText, { sticky: true });
            console.log("ERROR", arguments);
            return true;
        });
    };
})();