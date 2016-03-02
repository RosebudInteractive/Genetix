/**
 * Created by kiknadze on 26.02.2016.
 */

define(
    ['/scripts/lib/uccello/uses/template.js', 'text!./templates/adaptiveContainer.html'
        , '/scripts/controls/simpleview/vbase.js'],
    function(template, tpl, Base) {
        var vAContainer = {};
        for (var i in Base)
            vAContainer[i] = Base[i];

        vAContainer._templates = template.parseTemplate(tpl);
        vAContainer.render = function(options) {
            var that = this;
            var item = $('#' + this.getLid());
            if (item.length == 0) {
                // объект контейнера
                var pItem = $(vAContainer._templates['aContainer']).attr('id', "mid_" + this.getLid());
                item = pItem.children(".control").attr('id', this.getLid());

                // добавляем в парент
                var parent = this.getParentComp()? '#ch_' + this.getLid(): options.rootContainer;
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
            if (this.getParentComp() && !this.getParentComp().getParentComp()) {
                if (this.getParentComp().isCentered() === undefined || !this.getParentComp().isCentered())
                    cont.css("padding", "0");
                item.addClass("m-container")
            } else if (!this.hasPadding()) {
                cont.css("padding", "0");
            }

            // создаем врапперы для разметок
            var child = vAContainer._getCurrentLayout.call(this);
            var div = $('#lay_'+child.getLid());
            if (div.length == 0) {
                div = $('<div class="control-wrapper"><div class="control-separator"/><div class="mid-wrapper"></div></div>').attr('id', 'lay_' + child.getLid());
                div.children(".mid-wrapper").attr('id', 'ch_' + child.getLid());
                cont.append(div);
            }
            vAContainer._renderLayout.call(this, child);

            $(window).on("genetix:resize", function () {
                var p = that.getParentComp()? '#ch_' + that.getLid(): options.rootContainer;
                $(p).css("height", "");
                $(p).css("height", $(p).parent().height());
                var pp = $("#mid_" + that.getLid());
                pp.css("height", "");
                pp.css("height", $(p).height());

                var layout = vAContainer._getCurrentLayout.call(that);
                vAContainer._handleResize.call(that, layout);
            });
            vAContainer._setVisible.call(this);
            vAContainer._genEventsForParent.call(this);
            var layout = vAContainer._getCurrentLayout.call(this);
            vAContainer._handleResize.call(this, layout);
        }

        vAContainer._handleResize = function(layout) {
            var p = '#ch_' + layout.getLid();
            $(p).css("height", "");
            $(p).css("height", $(p).parent().height());
            var pp = $("#mid_" + layout.getLid());
            pp.css("height", "");
            pp.css("height", $(p).height());

            var children = layout.getCol("Layouts");
            for (var i = 0; i < children.count(); i++) {
                var child = children.get(i);
                vAContainer._handleResize.call(this, child);
            }
        }

        vAContainer._getCurrentLayout = function() {
            var children = this.getCol('Layouts');
            for(var i=0; i<children.count();i++) {
                // Корневая разметка берется одна. Потом надо будет выбирать какая именно
                return children.get(i);
            }
            return null;
        }

        vAContainer._renderLayout = function(layout) {
            var that = this;
            var item = $("#" + layout.getLid());
            var pItem = null;
            if (item.length == 0) {
                var template = "vContainer";
                if (layout.direction() == "horizontal") template = "hContainer";
                else if (layout.direction() == "layer") template = "lContainer";
                pItem = $(vAContainer._templates[template]).attr('id', "mid_" + layout.getLid());
                item = pItem.children(".control").attr('id', layout.getLid());
                $("#ch_" + layout.getLid()).append(pItem);
            } else {
                pItem = $("#mid_" + layout.getLid());
            }

            vAContainer._setLayoutCSS.call(this, layout);

            var cont = item.children(".c-content");
            var children = layout.getCol('Layouts');
            if (layout.control()) {
                child = layout.control();
                var div = $('#ext_'+child.getLid());
                if (div.length == 0) {
                    div = $('<div class="control-wrapper"><div class="control-separator"/><div class="mid-wrapper"></div></div>').attr('id', 'ext_' + child.getLid());
                    div.children(".mid-wrapper").attr('id', 'ch_' + child.getLid());
                    div.css({width: "100%", height: "100%"});
                    cont.append(div);
                    div.on("genetix:childPropChanged", function(event, data) {
                        vAContainer.handleChildChanged.call(that, event, data);
                        return false;
                    });
                }
            } else {
                for (var i = 0; i < children.count(); i++) {
                    var child = children.get(i);
                    var div = $('#lay_' + child.getLid());
                    if (div.length == 0) {
                        div = $('<div class="control-wrapper"><div class="control-separator"/><div class="mid-wrapper"></div></div>').attr('id', 'lay_' + child.getLid());
                        div.children(".mid-wrapper").attr('id', 'ch_' + child.getLid());
                        cont.append(div);
                        vAContainer._renderLayout.call(this, child)
                    }
                }
            }
        }

        vAContainer._handleLayoutContentResized = function(layout) {
            var height = layout.height() || "auto";
            if (height == "auto") {
                $("#mid_" + layout.getLid()).css("height", "");
                $("#ch_" + layout.getLid()).css("height", "");
                var cont = $("#" + layout.getLid()).children();
                var h = 0;
                cont.children().each(function() {
                    h += $(this).height();
                });
                $("#lay_" + layout.getLid()).css({"height": h, "min-height": h});
            }
        }

        vAContainer._setLayoutCSS = function(child) {
            var parent = child.getParentComp();
            var div = $("#lay_" + child.getLid());
            var chDiv = div.children();

            if (!parent.direction || parent.direction() == "layer") {
                div.css({width: "100%", height: "100%"});
            } else {
                var dimName = parent.direction() == "horizontal" ? "width" :
                    (parent.direction() == "vertical" ? "height" : "");
                var dim = child[dimName]() || "auto";
                var flex = "none";
                if (dim != "auto") {
                    if ($.isNumeric(dim))
                        dim += "px";
                    else if (dim.length > 0 && dim[dim.length - 1] == "%") {
                        var perc = dim.replace("%", "");
                        dim = "auto";
                        flex = perc + " 0 auto";
                    }
                    div.css(dimName, dim);
                    div.css("min-"+dimName, (flex == "" ? dim : "0px"));
                } else {
                    var chEDiv = $("#" + child.getLid());
                    div.css("min-"+dimName, chEDiv.height());
                    div.css(dimName, chEDiv.height());
                }
                div.css({
                    "flex": flex,
                    "-webkit-flex": flex,
                    "-ms-flex": flex
                });
            }

        }

        /**
         * Оповещение парента об изменениях пропертей
         * @private
         */
        vAContainer._genEventsForParent = function() {
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
            if (this.isFldModified("Visible")) { changedFields.Visible = true; genEvent = true; }

            if (genEvent) {
                $('#ext_' + this.getLid()).trigger("genetix:childPropChanged", {
                    control: this,
                    properties: changedFields
                });
            }
        }

        vAContainer.handleChildChanged = function(event, data) {
            console.log(event);
            if (!("Height" in data.properties)) return;
            var child = data.control;
            var div = $(event.target);
            var height = child.height() || "auto";
            var flex = "";
            if (height != "auto") {
                if ($.isNumeric(height))
                    height += "px";
                else if (height.length > 0 && height[height.length - 1] == "%") {
                    var perc = height.replace("%", "");
                    //height = "auto";
                    flex = perc + " 0 " + height;
                }
                div.css({
                    "height": height,
                    "flex": flex,
                    "-webkit-flex": flex,
                    "-ms-flex": flex,
                    "min-height": 0
                });
            } else {
                var chEDiv = $("#" + child.getLid());
                div.css({
                    "min-height" : chEDiv.height(),
                    "height": chEDiv.height()
                });
                div.css({
                    "flex": flex,
                    "-webkit-flex": flex,
                    "-ms-flex": flex
                });
            }

            var currLayout = vAContainer._getCurrentLayout.call(this);
            var layout = this._getLayoutByControl(currLayout, child.getGuid());
            vAContainer._handleLayoutContentResized.call(this, layout);
        }
        return vAContainer;
    }
);
