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
                    if ($.isNumeric(width)) width += 'px';
                    if ($.isNumeric(height)) height += 'px';
                    div.css({width:width, height:height});
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