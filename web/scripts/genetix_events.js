/**
 * User: kiknadze
 * Date: 25.06.2015
 * Time: 9:48
 */
$(document).ready( function() {
    $(".system-toolbar-icon.is-device-close-icon").click(function() {
        setTimeout(function() {
            $(window).trigger("genetix:resize");
        }, 300);
    });

    $(window).resize(function() {
        $(window).trigger("genetix:resize");
    });
});
