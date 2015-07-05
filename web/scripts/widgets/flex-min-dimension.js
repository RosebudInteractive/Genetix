/**
 * User: kiknadze
 * Date: 02.07.2015
 * Time: 15:21
 */
define(
    'flex-min-dimension',
    function() {
        $.widget( "custom.genetixFlexMinDimention", {
            options: {
                minSize: 0,
                sizeUnits: "px",
                dimension: 0, // 0 - высота, 1 - ширина
                realMinSize: 0
            },

            _create: function () {
                var that = this;

                if (this.options.sizeUnits == "em") {
                    var fontSize = this.element.css("font-size");
                    fontSize = fontSize.replace("px", "");
                    console.log(fontSize);
                    this.options.realMinSize = fontSize * this.options.minSize;
                } else
                    this.options.realMinSize = this.options.minSize;

                $(window).on("genetix:resize", function () {
                    that._resizeHandler();
                });

                setTimeout(function() {
                    that._resizeHandler();
                }, 0);
            },
            _resizeHandler: function() {
                var newSize = 0;
                if (this.options.dimension == 0) {
                    this.element.css("height", "");
                    newSize = this.element.height();
                }
                else {
                    this.element.css("width", "");
                    newSize = this.element.width();
                }
                if (newSize <= this.options.realMinSize) {
                    if (this.options.dimension == 0)
                        this.element.height(this.options.realMinSize);
                    else
                        this.element.width(this.options.realMinSize);
                }

            }
        });
    }
);
