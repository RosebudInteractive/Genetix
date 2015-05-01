/**
 * User: kiknadze
 * Date: 30.04.2015
 * Time: 15:20
 */
$(document).ready(function () {
    require(
        ['/scripts/lib/uccello/uses/template.js', 'text!/containers-layout/frame-template.html'],
        function (template, tpl) {
            var templates = template.parseTemplate(tpl);

            $("#source-code").val("16,35,50    \n" +
                "Container,16,4              \n" +
                "  Container,8,4             \n" +
                "    label,8,2,Левый глаз,br \n" +
                "    label,2,2,Цвет          \n" +
                "    Edit,2,2                \n" +
                "    label,2,2,Острота зрения\n" +
                "    Edit,2,2,br             \n" +
                "    label,2,2,Поражение     \n" +
                "    Edit,2,2                \n" +
                "    label,2,2,Цвет роговицы \n" +
                "    Edit,2,2,br             \n" +
                "    label,2,2,Заключение    \n" +
                "    Edit,2,2                \n" +
                "  Container,8,4            \n" +
                "    label,2,2,Правый глаз,br\n" +
                "    label,2,2,Цвет          \n" +
                "    Edit,2,2                \n" +
                "    label,2,1,Острота зрения\n" +
                "    Edit,2,2,br             \n" +
                "    label,2,1,Поражение     \n" +
                "    Edit,2,2                \n" +
                "    label,2,2,Цвет роговицы \n" +
                "    Edit,2,2,br             \n" +
                "    label,2,2,Заключение    \n" +
                "    Edit,2,2");

            $("#params-div").find("textarea").autosize({
                callback: function (el) {
                }
            });

            var $frame = $('iframe');

            var iframe = ($frame[0].contentWindow) ? $frame[0].contentWindow : ($frame[0].contentDocument.document) ? $frame[0].contentDocument.document : $frame[0].contentDocument;
            iframe.document.open();
            iframe.document.write(templates["page"]);
            iframe.document.close();


            $("#apply-button").click(function () {
                parseInput($("#source-code").val());
            });
        });

    function parseInput(content) {
        window.frames[0].frameElement.contentWindow.HtmlGenerator.parseInput(content);
    }
});


