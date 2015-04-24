define(
    ['/scripts/lib/uccello/uses/template.js', 'text!./templates/cContainer.html'],
    function(template, tpl) {
        var vCContainer = {};
        vCContainer._templates = template.parseTemplate(tpl);
        vCContainer.render = function(options) {
            var item = $('#' + this.getLid());
            if (item.length == 0) {
                // объект контейнера
                item = $(vCContainer._templates['container']).attr('id', this.getLid());
                var cont = item.children(".c-content");
                // создаем врапперы для чайлдов
                var childs = this.getCol('Children');
                for(var i=0; i<childs.count();i++) {
                    var child = this.getControlMgr().get(childs.get(i).getGuid());
                    if (!child.left) continue;
                    var div = $('<div class="control-wrapper"></div>').attr('id', 'ch_'+child.getLid());
                    var left=child.left(), top=child.top(), width=child.width(), height=child.height();
                    if ($.isNumeric(left)) left += 'px';
                    if ($.isNumeric(top)) top += 'px';
                    if ($.isNumeric(width)) width += 'px';
                    if ($.isNumeric(height)) height += 'px';
                    div.css({top:top, left:left, width:width, height:height, position: "absolute"});
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

        return vCContainer;
    }
);