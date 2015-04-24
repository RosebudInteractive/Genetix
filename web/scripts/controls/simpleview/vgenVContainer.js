define(
    ['/scripts/lib/uccello/uses/template.js', 'text!./templates/container.html'],
    function(template, tpl) {
        var vContainer = {};
        vContainer._templates = template.parseTemplate(tpl);
        vContainer.render = function(options) {
            var item = $('#' + this.getLid());
            if (item.length == 0) {
                item = $(vContainer._templates['container']).attr('id', this.getLid());
                var cont = item.children(".c-content");
                var parent = this.getParent()? '#ch_' + this.getLid(): options.rootContainer;

                if (this.background())
                    cont.css({"background-color" : this.background()});
                if (this.position() == "center")
                    cont.css({"border-radius" : "0.25em"});

                var childs = this.getCol('Children');
                for(var i=0; i<childs.count();i++) {
                    var child = this.getControlMgr().get(childs.get(i).getGuid());
                    if (!child.left) continue;
                    var div = $('<div class="control-wrapper"></div>').attr('id', 'ch_'+child.getLid());

                    if ("position" in child && child.position() == "center") {
                        div.css({
                            margin: "0",
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)"/*,
                            "box-shadow": "1px 1px 0.75em 1px #3c4251",
                            "-webkit-box-shadow" : "1px 1px 0.75em 1px #3c4251",
                            "-moz-box-shadow" : "1px 1px 0.75em 1px #3c4251",
                            "border-radius": "0.25em"*/
                        });

                    } else {
                        div.css({width: "100%"});
                        var height = child.height() || "auto";
                        var flex = "";
                        if (height != "auto") {
                            if ($.isNumeric(height))
                                height += "px";
                            else if (height.length > 0 && height[height.length - 1] == "%") {
                                var perc = height.replace("%", "");
                                height = "auto";
                                flex = perc + " 0 auto";
                            }
                        }
                        div.css({"height": height, "flex": flex, "-webkit-flex": flex, "-ms-flex": flex, "min-height": 0});
                    }

                    cont.append(div);
                }

                $(parent).append(item);


            }

            // убираем удаленные объекты
            //var del = this.getObj().getLogCol('Children').del;
            var del = this.getLogCol('Children').del;
            for (var guid in del)
                $('#' + del[guid].getLid()).remove();

        }
        return vContainer;
    }
);