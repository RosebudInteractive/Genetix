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

            $("#source-code").val("8,100     \n" +
                "Container,0-7,2               \n" +
                "  Container,0-3,2             \n" +
                "    label,0-3,2,Левый глаз,br \n" +
                "    label,0-1,2,Цвет          \n" +
                "    Edit,2-3,2                \n" +
                "    label,0-1,2,Острота зрения\n" +
                "    Edit,2-3,2,br             \n" +
                "    label,0-1,2,Поражение     \n" +
                "    Edit,2-3,2                \n" +
                "    label,0-1,2,Цвет роговицы \n" +
                "    Edit,2-3,2,br             \n" +
                "    label,0-0,2,Заключение    \n" +
                "    Edit,1-3,2                \n" +
                "  Container,4-7,2             \n" +
                "    label,0-3,2,Правый глаз,br\n" +
                "    label,0-1,2,Цвет          \n" +
                "    Edit,2-3,2                \n" +
                "    label,0-1,2,Острота зрения\n" +
                "    Edit,2-3,2,br             \n" +
                "    label,0-1,2,Поражение     \n" +
                "    Edit,2-3,2                \n" +
                "    label,0-1,2,Цвет роговицы \n" +
                "    Edit,2-3,2,br             \n" +
                "    label,0-0,2,Заключение    \n" +
                "    Edit,1-3,2");

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


