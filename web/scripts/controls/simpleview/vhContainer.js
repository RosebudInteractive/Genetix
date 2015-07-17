define(
    ['/scripts/lib/uccello/uses/template.js', 'text!./templates/hContainer.html'],
    function(template, tpl) {
        var vHContainer = {};
        vHContainer._templates = template.parseTemplate(tpl);
        vHContainer.render = function(options) {
            var that = this;
            var item = $('#' + this.getLid());
            if (item.length == 0) {
                // объект контейнера
                var pItem = $(vHContainer._templates['container']).attr('id', "mid_" + this.getLid());
                item = pItem.children(".control").attr('id', this.getLid());

                // добавляем в парент
                var parent = this.getParent()? '#ch_' + this.getLid(): options.rootContainer;
                $(parent).append(pItem);
                pItem.height($(parent).height());
            } else {
                pItem = $("#mid_" + this.getLid());
            }

            if (this.verticalAlign()) {
                pItem.css("display", "table-cell");
                var vAl = this.verticalAlign().toUpperCase();
                if (vAl == "TOP")
                    pItem.css("vertical-align", "top");
                else if (vAl == "BOTTOM")
                    pItem.css("vertical-align", "bottom");
                else
                    pItem.css("vertical-align", "middle");
            }
            else {
                pItem.css("display", "");
                pItem.css("vertical-align", "");
            }

            if (this.height() == "auto")
                item.css({height: "auto"});

            var cont = item.children(".c-content");
            // создаем врапперы для чайлдов
            var childs = this.getCol('Children');
            for(var i=0; i<childs.count();i++) {
                var child = this.getControlMgr().get(childs.get(i).getGuid());
                if (!child.left) continue;
                var div = $('#ext_'+child.getLid());
                if (div.length == 0) {
                    div = $('<div class="control-wrapper"><div class="mid-wrapper"></div></div>').attr('id', 'ext_' + child.getLid());
                    div.children().attr('id', 'ch_' + child.getLid());
                    cont.append(div);
                    div.on("genetix:childPropChanged", function(event, data) {
                        vHContainer.handleChildChanged.call(that, event, data);
                    });
                    cont.append(div);

                    if (child.minWidth()) {
                        var u = "em";
                        var h = 0;
                        if ($.isNumeric(child.minWidth()))
                            h = child.minWidth();
                        else {
                            h = child.minWidth();
                            h = h.substr(0, h.length - 2);
                            u = h.substr(h.length - 2, 2);
                        }
                        div.genetixFlexMinDimention({
                            minSize: h,
                            sizeUnits: u,
                            dimension: 1
                        });
                    }
                }
                var width=child.width() || "auto";
                var flex = "";
                if (width != "auto") {
                    if ($.isNumeric(width))
                        width += "px";
                    else if (width.length > 0 && width[width.length - 1] == "%") {
                        var perc = width.replace("%", "");
                        flex = perc + " 0 " + width;
                    }
                }
                div.css({flex: flex,  '-webkit-flex': flex, '-ms-flex': flex});

                var chDiv = div.children();
                if (child.padLeft())
                    chDiv.css("padding-left", child.padLeft());
                else
                    chDiv.css("padding-left", "");
                if (child.padRight())
                    chDiv.css("padding-right", child.padRight());
                else
                    chDiv.css("padding-right", "");
                if (child.padTop())
                    chDiv.css("padding-top", child.padTop());
                else
                    chDiv.css("padding-top", "");
                if (child.padBottom())
                    chDiv.css("padding-bottom", child.padBottom());
                else
                    chDiv.css("padding-bottom", "");
                if (child.minHeight())
                    div.css("min-height", child.minHeight());
                else
                    div.css("min-height", "");

                if (child.verticalAlign()) {
                    var vAl = child.verticalAlign().toUpperCase();
                    if (vAl == "CENTER") {
                        chDiv.css("float", "");
                        chDiv.css("display", "table");
                    }
                }
            }

            // убираем удаленные объекты
            var del = this.getLogCol('Children') && 'del' in this.getLogCol('Children')? this.getLogCol('Children').del: {};
            for (var guid in del)
                $('#ext_' + del[guid].getLid()).remove();

            $(window).on("genetix:resize", function () {
                var p = that.getParent()? '#ch_' + that.getLid(): options.rootContainer;
                pp.css("height", "");
                var pp = $("#mid_" + that.getLid());
                pp.css("height", $(p).height());
                var childs = that.getCol('Children');
                for(var i=0; i<childs.count();i++) {
                    var child = that.getControlMgr().get(childs.get(i).getGuid());
                    if (!child.left) continue;
                    var div = $('#ext_' + child.getLid());
                    div.children().css("height", div.height());
                }
            });
            vHContainer._genEventsForParent.call(this);
        }

        /**
         * Оповещение парента об изменениях пропертей
         * @private
         */
        vHContainer._genEventsForParent = function() {
            var genEvent = false;
            var changedFields = {};
            if (this.isFldModified("Width")) { changedFields.Width = true; genEvent = true; }
            if (this.isFldModified("Height")) { changedFields.Height = true; genEvent = true; }
            if (genEvent) {
                $('#ext_' + this.getLid()).trigger("genetix:childPropChanged", {
                    control: this,
                    properties: changedFields
                });
            }
        }

        vHContainer.handleChildChanged = function(event, data) {
            console.log(event);
            if (!("Width" in data.properties)) return;
            var child = data.control;
            var div = $(event.target);
            var width = child.width() || "auto";
            var flex = "";
            if (width != "auto") {
                if ($.isNumeric(width))
                    width += "px";
                else if (width.length > 0 && width[width.length - 1] == "%") {
                    var perc = width.replace("%", "");
                    //height = "auto";
                    flex = perc + " 0 " + width;
                }
            }
            div.css({
                "width": width,
                "flex": flex,
                "-webkit-flex": flex,
                "-ms-flex": flex,
                "min-height": 0
            });

        }

        return vHContainer;
    }
);