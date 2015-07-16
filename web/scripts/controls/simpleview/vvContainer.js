define(
    ['/scripts/lib/uccello/uses/template.js', 'text!./templates/vContainer.html'],
    function(template, tpl) {
        var vVContainer = {};
        vVContainer._templates = template.parseTemplate(tpl);
        vVContainer.render = function(options) {
            var item = $('#' + this.getLid());
            if (item.length == 0) {
                // объект контейнера
                var pItem = $(vContainer._templates['container']).attr('id', "mid_" + this.getLid());
                item = pItem.children(".control").attr('id', this.getLid());
                var cont = item.children(".c-content");
                // создаем врапперы для чайлдов
                var childs = this.getCol('Children');
                for(var i=0; i<childs.count();i++) {
                    var child = this.getControlMgr().get(childs.get(i).getGuid());
                    if (!child.left) continue;
                    var div = $('<div class="control-wrapper"><div class="mid-wrapper"></div></div>').attr('id', 'ext_'+child.getLid());
                    div.children().attr('id', 'ch_' + child.getLid());
                    div.css({width: "100%"});
                    var height = child.height();
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


                    //var width=child.width();
                    //if ($.isNumeric(width)) width += 'px';
                    div.css({"height": height, "flex": flex, "-webkit-flex": flex, "-ms-flex": flex, "min-height": 0});
                    cont.append(div);
                }

                // добавляем в парент
                var parent = this.getParent()? '#ch_' + this.getLid(): options.rootContainer;
                $(parent).append(pItem);
            }

            // убираем удаленные объекты
            var del = this.getLogCol('Children') && 'del' in this.getLogCol('Children')? this.getLogCol('Children').del: {};
            for (var guid in del)
                $('#' + del[guid].getLid()).remove();

            $(window).on("genetix:resize", function () {
                var childs = that.getCol('Children');
                for(var i=0; i<childs.count();i++) {
                    var child = that.getControlMgr().get(childs.get(i).getGuid());
                    if (!child.left) continue;
                    var div = $('#ext_' + child.getLid());
                    div.children().css("height", div.height());
                }
            });
            vVContainer._genEventsForParent.call(this);
        }

        /**
         * Оповещение парента об изменениях пропертей
         * @private
         */
        vVContainer._genEventsForParent = function() {
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

        return vVContainer;
    }
);