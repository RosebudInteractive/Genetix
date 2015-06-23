define(
    ['/scripts/lib/uccello/uses/template.js', 'text!./templates/hContainer.html'],
    function(template, tpl) {
        var vHContainer = {};
        vHContainer._templates = template.parseTemplate(tpl);
        vHContainer.render = function(options) {
            var item = $('#' + this.getLid());
            if (item.length == 0) {
                // объект контейнера
                item = $(vHContainer._templates['container']).attr('id', this.getLid());
                var cont = item.children(".c-content");
                // создаем врапперы для чайлдов
                var childs = this.getCol('Children');
                for(var i=0; i<childs.count();i++) {
                    var child = this.getControlMgr().get(childs.get(i).getGuid());
                    if (!child.left) continue;
                    var div = $('<div class="control-wrapper"></div>').attr('id', 'ch_'+child.getLid());
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
                    cont.append(div);
                }

                // добавляем в парент
                var parent = this.getParent()? '#ch_' + this.getLid(): options.rootContainer;
                $(parent).append(item);
                item.height($(parent).height())
            }

            // убираем удаленные объекты
            var del = this.getLogCol('Children').del;
            for (var guid in del)
                $('#' + del[guid].getLid()).remove();

        }

        return vHContainer;
    }
);