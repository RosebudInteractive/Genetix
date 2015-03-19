define(
    ['/scripts/lib/uccello/uses/template.js', 'text!./templates/label.html'],
    function(template, tpl) {
        var vLabel = {};
        vLabel._templates = template.parseTemplate(tpl);
        vLabel.render = function(options) {
            var item = $('#' + this.getLid());
            if (item.length == 0) {
                item = $(vLabel._templates['label']).attr('id', this.getLid());
                var parent = (this.getParent()? '#' + this.getParent().getLid(): options.rootContainer);
                $(parent).append(item);
            }
            item.css({top: this.top() + 'px', left: this.left() + 'px'}).html(this.label());
            if (this.fontSize( ))
                item.css({"font-size": this.fontSize()});
            if (this.color())
                item.css({"color": this.color()});
            // фонт
            if (this.fontFamily())
                item.css({"font-family": this.fontFamily()});
            else
                item.css({"font-family": "OpenSansSemiboldRegular"});

        }
        return vLabel;
    }
);