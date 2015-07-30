/**
 * User: kiknadze
 * Date: 25.06.2015
 * Time: 9:48
 */
$(document).ready( function() {

    $(window).resize(function() {
        $(window).trigger("genetix:resize");
    });
});
