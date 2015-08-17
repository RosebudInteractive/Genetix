/**
 * User: kiknadze
 * Date: 13.08.2015
 * Time: 8:32
 */
define(
    ['/scripts/lib/uccello/uses/template.js', 'text!./templates/toolbar.html'],
    function(template, tpl) {
        var vToolbar = {};
        vToolbar._templates = template.parseTemplate(tpl);

        vToolbar.render = function(options) {
            var that = this;
            var item = $('#' + this.getLid());
            if (item.length == 0) {
                // объект контейнера
                var pItem = $(vToolbar._templates['toolbar']).attr('id', "mid_" + this.getLid());
                item = pItem.children(".control").attr('id', this.getLid());

                // добавляем в парент
                var parent = this.getParent()? '#ch_' + this.getLid(): options.rootContainer;
                $(parent).append(pItem);
                pItem.height($(parent).height());
            } else {
                pItem = $("#mid_" + this.getLid());
            }

            var tStyle = this.toolbarSize() || "big";
            tStyle = tStyle.toUpperCase();

            if (tStyle  == "BIG") {
                item.addClass("is-big");
                item.removeClass("is-small");
            } else {
                item.removeClass("is-big");
                item.addClass("is-small");
            }
            var tColor = this.toolbarColor() || "blue";
            tColor = tColor.toUpperCase();
            if (tColor  == "BLUE") {
                item.addClass("is-blue");
                item.removeClass("is-white");
            } else {
                item.removeClass("is-blue");
                item.addClass("is-white");
            }

            var cont = item.children(".c-content");
            var space = "";
            if (this.spacing()) {
                space = this.spacing();
                if ($.isNumeric(space))
                    space += "px";
                cont.css({"padding-left": space, "padding-right" : space});
            } else
                cont.css({"padding-left": "", "padding-right" : ""});

            var contAlign = this.contentAlign() || "left";
            contAlign = contAlign.toUpperCase();
            if (contAlign == "LEFT") {
                item.addClass("is-left");
                item.removeClass("is-right");
            } else {
                item.removeClass("is-left");
                item.addClass("is-right");
            }

            var tCaptionStyle = this.captionStyle() || "none";
            tCaptionStyle = tCaptionStyle.toUpperCase();
            var elWrapper = cont.children(".c-caption-wrapper");
            elWrapper.css("padding-right", space);
            if (tCaptionStyle == "NONE") {
                elWrapper.css("display", "none");
            } else {
                var imgWrapper = elWrapper.find(".t-caption-icon-wrapper");
                imgWrapper.empty();
                if (this.image()) {
                    var imgTmpl = vToolbar._templates['svg'];
                    imgTmpl = imgTmpl.replace("###IMAGE###", this.image());
                    var tStyle = this.toolbarSize() || "big";
                    tStyle = tStyle.toUpperCase();
                    var imgSize = "16";
                    if (tStyle  == "BIG") imgSize = "22";
                    while (imgTmpl.indexOf("###SIZE###") != -1)
                        imgTmpl = imgTmpl.replace("###SIZE###", imgSize);
                    imgWrapper.append($(imgTmpl));
                }
                elWrapper.find(".t-caption-text").text(this.caption());

                cont.children(".c-caption-wrapper").css("display", "");
                if (tCaptionStyle == "TEXT") {
                    elWrapper.find(".t-caption-icon-wrapper").css("display", "none");
                    elWrapper.find(".t-caption-title-wrapper").css("display", "");
                } else if (tCaptionStyle == "IMAGE") {
                    elWrapper.find(".t-caption-icon-wrapper").css("display", "");
                    elWrapper.find(".t-caption-title-wrapper").css("display", "none");
                } else {
                    elWrapper.find(".t-caption-icon-wrapper").css("display", "");
                    elWrapper.find(".t-caption-title-wrapper").css("display", "");
                }


            }

            // создаем врапперы для чайлдов
            var children = this.getCol('Children');
            for(var i=0; i<children.count();i++) {
                var child = this.getControlMgr().get(children.get(i).getGuid());
                if (!child.left) continue;
                var div = $('#ext_'+child.getLid());
                if (div.length == 0) {
                    div = $('<div class="control-wrapper"><div class="mid-wrapper"></div></div>').attr('id', 'ext_' + child.getLid());
                    div.children().attr('id', 'ch_' + child.getLid());
                    cont.append(div);
                    div.on("genetix:childPropChanged", function(event, data) {
                        vToolbar.handleChildChanged.call(that, event, data);
                        return false;
                    });
                    cont.append(div);

                }
                vToolbar._setChildCSS(child);
            }

            // убираем удаленные объекты
            var del = this.getLogCol('Children') && 'del' in this.getLogCol('Children')? this.getLogCol('Children').del: {};
            for (var guid in del)
                $('#ext_' + del[guid].getLid()).remove();

            $(window).on("genetix:resize", function () {
            });
            vToolbar._genEventsForParent.call(this);
        }

        vToolbar._setChildCSS = function(child) {
            var div = $("#ext_" + child.getLid())
            var chDiv = div.children();
            var width=child.width() || "auto";
            if ($.isNumeric(width))
                width += "px";
            div.css({width: width});

            if (child.minWidth())
                div.css("min-width", child.minWidth());
            else
                div.css("min-width", "");
        }

        /**
         * Оповещение парента об изменениях пропертей
         * @private
         */
        vToolbar._genEventsForParent = function() {
            var genEvent = false;
            var changedFields = {};
            if (this.isFldModified("Width")) { changedFields.Width = true; genEvent = true; }
            if (this.isFldModified("Height")) { changedFields.Height = true; genEvent = true; }
            if (this.isFldModified("HorizontalAlign")) { changedFields.HorizontalAlign = true; genEvent = true; }
            if (this.isFldModified("VerticalAlign")) { changedFields.VerticalAlign = true; genEvent = true; }
            if (this.isFldModified("MinWidth")) { changedFields.MinWidth = true; genEvent = true; }
            if (this.isFldModified("MinHeight")) { changedFields.MinHeight = true; genEvent = true; }
            if (this.isFldModified("MaxWidth")) { changedFields.MaxWidth = true; genEvent = true; }
            if (this.isFldModified("MaxHeight")) { changedFields.MaxHeight = true; genEvent = true; }
            if (this.isFldModified("PadLeft")) { changedFields.PadLeft = true; genEvent = true; }
            if (this.isFldModified("PadRight")) { changedFields.PadRight = true; genEvent = true; }
            if (this.isFldModified("PadTop")) { changedFields.PadTop = true; genEvent = true; }
            if (this.isFldModified("PadBottom")) { changedFields.PadBottom = true; genEvent = true; }

            if (genEvent) {
                $('#ext_' + this.getLid()).trigger("genetix:childPropChanged", {
                    control: this,
                    properties: changedFields
                });
            }
        }

        vToolbar.handleChildChanged = function(event, data) {
            if (!("Height" in data.properties)) return;
            var child = data.control;
            vToolbar._setChildCSS.call(this, child);
        }

        return vToolbar;
    });
