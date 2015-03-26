/**
 * User: kiknadze
 * Date: 26.03.2015
 * Time: 11:12
 */
$(document).ready( function() {
    $("#color-select").change(function () {
        var newClass = $(this).val();
        var allClasses = "is-white is-green";
        var remClasses = allClasses.replace(newClass, "");
        $(".control.button").removeClass(remClasses);
        $(".control.button").addClass(newClass);
    });
    $(".control.button").click(function () {
        $(this).toggleClass("is-click");
    });
    $("#button-caption input").change(function () {
        $(".control.button input").val($(this).val());
    });
    $("#grow").change(function () {
        $("body").toggleClass("is-big");
    });
});
