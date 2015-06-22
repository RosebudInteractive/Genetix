define(
    ['/scripts/lib/uccello/uses/template.js', 'text!./templates/form.html'],
    function(template, tpl) {
        var vForm = {};
        vForm._templates = template.parseTemplate(tpl);
        vForm.render = function(options) {
            var item = $('#' + this.getLid());
            if (item.length == 0) {
                item = $(vForm._templates['form']).attr('id', this.getLid());
                var parent = (this.getParent()? '#ch_' + this.getParent().getLid(): options.rootContainer);
                var p = $(parent);
                p.append(item);
                var cont = item.children(".c-content");

                item.css({top: 0 + 'px', left: 0 + 'px', width: 100 + '%', height: p.innerHeight() + 'px'});
                $(window).resize(function (e, obj) {
                    item.css({top: 0 + 'px', left: 0 + 'px', width: 100 + '%', height: p.innerHeight() + 'px'});
                });

                // создаем врапперы для чайлдов
                var childs = this.getCol('Children');
                for(var i=0; i<childs.count();i++) {
                    var child = this.getControlMgr().get(childs.get(i).getGuid());
                    if (!child.left) continue;
                    var div = $('<div class="control-wrapper"></div>').attr('id', 'ch_'+child.getLid());
                    var width=child.width(), height=child.height();

                    if (this.isCentered()) {
                        item.addClass("is-centered");
                        div.css({
                            margin: "0",
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            /*"box-shadow": "1px 1px 0.75em 1px #3c4251",
                             "-webkit-box-shadow" : "1px 1px 0.75em 1px #3c4251",
                             "-moz-box-shadow" : "1px 1px 0.75em 1px #3c4251",
                             "border-radius": "0.25em",*/
                            "width": width,
                            "height": height
                        });

                    } else {
                        div.css({width: "100%"});
                        var height = child.height() || "auto";
                        var flex = "";
                        if (height != "auto") {
                            if ($.isNumeric(height))
                                height += "px";
                            else if (height.length > 0 && height[height.length - 1] == "%") {
                                if (childs.count() == 1) {
                                    height = "100%";
                                } else {
                                    var perc = height.replace("%", "");
                                    height = "auto";
                                    flex = perc + " 0 auto";
                                }
                            }
                        }
                        div.css({"height": height, "flex": flex, "-webkit-flex": flex, "-ms-flex": flex, "min-height": 0});
                    }
                    cont.append(div);
                }

            }

            // убираем удаленные объекты
            //var del = this.getObj().getLogCol('Children').del;
            var del = this.getLogCol('Children').del;
            for (var guid in del)
                $('#ch_' + del[guid].getLid()).remove();

        }
        return vForm;
    }
);