define(
    ['/scripts/lib/uccello/uses/template.js', 'text!./templates/form.html'],
    function(template, tpl) {
        var vForm = {};
        vForm._templates = template.parseTemplate(tpl);
        vForm.render = function(options) {
            var item = $('#' + this.getLid());
            if (item.length == 0) {
                item = $(vForm._templates['form']).attr('id', this.getLid());
                var parent = (this.getParent()? '#' + this.getParent().getLid(): options.rootContainer);
                $(parent).append(item);
            }

            //if (this.top())
            var p = $(parent)
            item.css({top: 0 + 'px', left: 0 + 'px', width: 100 + '%', height: p.height() + 'px'});
            //item.css({top: this.top() + 'px', left: this.left() + 'px', width: this.width() + 'px', height: this.height() + 'px'});

            // убираем удаленные объекты
            var del = this.getObj().getLogCol('Children').del;
            for (var guid in del)
                $('#' + del[guid].getLid()).remove();

        }
        return vForm;
    }
);