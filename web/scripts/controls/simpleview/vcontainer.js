define(
    ['/scripts/lib/uccello/uses/template.js', 'text!./templates/container.html'],
    function(template, tpl) {
        var vContainer = {};
        vContainer._templates = template.parseTemplate(tpl);
        vContainer.render = function(options) {
            var item = $('#' + this.getLid());
            if (item.length == 0) {
                item = $(vContainer._templates['container']).attr('id', this.getLid());
                var parent = (this.getParent()? '#' + this.getParent().getLid(): options.rootContainer);
                $(parent).append(item);
            }
            var p = $(parent);
            if (this.width())
                item.css({width: this.width()});
            if (this.height())
                item.css({height: this.height()});
            if (this.position() == "center") {
                item.css({
                    margin: "0",
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    "box-shadow": "1px 1px 0.75em 1px #3c4251",
                    "border-radius": "0.25em"
            });

            } else {
                if (this.left())
                    item.css({left: this.left()});
                if (this.top())
                    item.css({top: this.top()});
                if (!(this.left()) && !(this.top()) && !(this.width()) && !(this.height()))
                    item.css({top: 0 + 'px', left: 0 + 'px', width: 100 + '%', height: p.height() + 'px'});
            }

            if (this.background())
                item.css({"background-color" : this.background()});

            // убираем удаленные объекты
            var del = this.getObj().getLogCol('Children').del;
            for (var guid in del)
                $('#' + del[guid].getLid()).remove();

        }
        return vContainer;
    }
);