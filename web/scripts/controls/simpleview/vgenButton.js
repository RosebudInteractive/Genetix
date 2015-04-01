define(
    ['/scripts/lib/uccello/uses/template.js', 'text!./templates/button.html'],
    function(template, tpl) {
        var vButton = {};
        vButton._templates = template.parseTemplate(tpl);
        vButton.render = function(options) {
            var item = $('#' + this.getLid());
            if (item.length == 0) {
                item = $(vButton._templates['button']).attr('id', this.getLid());
                var parent = '#' + (this.getParent()? this.getParent().getLid():options.rootContainer);
                $(parent).append(item);
            }
            item.css({top: this.top() + 'px', left: this.left() + 'px'});
            item.find("input").val(this.caption());
            if (this.background())
                item.find("input").css({"background-color" : this.background()});
            if (this.color())
                item.find("input").css({"color" : this.color()});
            if (this.borderColor())
                item.find("input").css({"border-color" : this.borderColor()});
            if (this.extendedClass())
                item.addClass(this.extendedClass());
            else
                item.addClass("is-white");
        }
        return vButton;
    }
);