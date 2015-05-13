/**
 * User: kiknadze
 * Date: 30.04.2015
 * Time: 15:20
 */
$(document).ready(function () {
    require(
        [
            '/scripts/lib/uccello/uses/template.js',
            'text!/containers-layout/frame-template.html',
            'text!/containers-layout/samples-template.html',
        ],
        function (template, tpl, samplesTml) {
            var templates = template.parseTemplate(tpl);
            var samples = template.parseTemplate(samplesTml);

            $("#source-code").val(samples["eyes_new"]);

            $("#params-div").find("textarea").autosize({
                callback: function (el) {
                }
            });

            $("#sample-select").change(function() {
                $("#source-code").val(samples[$(this).val()]);
                $("#apply-button").click();
            });

            var $frame = $('iframe');

            var iframe = ($frame[0].contentWindow) ? $frame[0].contentWindow : ($frame[0].contentDocument.document) ? $frame[0].contentDocument.document : $frame[0].contentDocument;
            iframe.document.open();
            iframe.document.write(templates["page"]);
            iframe.document.close();


            $("#apply-button").click(function () {
                parseInput($("#source-code").val());
            });
            $("#show-grid").change(function() {
                window.frames[0].frameElement.contentWindow.drawGrid($("#show-grid").is(':checked'));
            });
        });

    function parseInput(content) {
        window.frames[0].frameElement.contentWindow.executeGenerator(content);
        window.frames[0].frameElement.contentWindow.drawGrid($("#show-grid").is(':checked'));
    }
});


