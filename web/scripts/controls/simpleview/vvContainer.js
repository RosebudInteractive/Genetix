define(
    ['/scripts/lib/uccello/uses/template.js', 'text!./templates/vContainer.html'],
    function(template, tpl) {
        var vVContainer = {};
        vVContainer._templates = template.parseTemplate(tpl);
        vVContainer.render = function(options) {
            var item = $('#' + this.getLid());
            if (item.length == 0) {
                // объект контейнера
                item = $(vVContainer._templates['container']).attr('id', this.getLid());
                var cont = item.children(".c-content");
                // создаем врапперы для чайлдов
                var childs = this.getCol('Children');
                for(var i=0; i<childs.count();i++) {
                    var child = this.getControlMgr().get(childs.get(i).getGuid());
                    if (!child.left) continue;
                    var div = $('<div class="control-wrapper"></div>').attr('id', 'ch_'+child.getLid());
                    div.css({width: "100%"});
                    var height = child.height();
                    var flex = "";
                    if (height != "auto") {
                        if ($.isNumeric(height))
                            height += "px";
                        else if (height.length > 0 && height[height.length - 1] == "%") {
                            height = "";
                            var perc = height.replace("%", "");
                            flex = perc + " 0 auto; -webkit-flex: " + perc + " 0 auto; -ms-flex: " + perc + " 0 auto";
                        }
                    }


                    //var width=child.width();
                    //if ($.isNumeric(width)) width += 'px';
                    div.css({height: height, flex: flex});
                    cont.append(div);
                }

                // добавляем в парент
                var parent = this.getParent()? '#ch_' + this.getLid(): options.rootContainer;
                $(parent).append(item);
            }

            // убираем удаленные объекты
            var del = this.getLogCol('Children').del;
            for (var guid in del)
                $('#' + del[guid].getLid()).remove();

        }

        return vVContainer;
    }
);