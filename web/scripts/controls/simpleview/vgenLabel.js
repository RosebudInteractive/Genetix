define(
    ['/scripts/lib/uccello/uses/template.js', 'text!./templates/label.html'],
    function(template, tpl) {
        var vLabel = {};
        vLabel._templates = template.parseTemplate(tpl);
        vLabel.render = function(options) {
            var item = $('#' + this.getLid());
            if (item.length == 0) {
                var pItem = $(vLabel._templates['label']).attr('id', "mid_" + this.getLid());
                item = pItem.children(".control").attr('id', this.getLid());
                var parent = (this.getParent()? '#ch_' + this.getLid(): options.rootContainer);
                $(parent).append(pItem);
            }
            item.css({width: "100%", height: "100%" }).html(this.label());
            if (this.fontSize( ))
                item.css({"font-size": this.fontSize()});
            if (this.color())
                item.css({"color": this.color()});
            // фонт
            if (this.fontFamily())
                item.css({"font-family": this.fontFamily()});
            if (this.fontWeight())
                item.css({"font-weight": this.fontWeight()});

            vLabel._genEventsForParent.call(this);
        }

        /**
         * Оповещение парента об изменениях пропертей
         * @private
         */
        vLabel._genEventsForParent = function() {
            var genEvent = false;
            var changedFields = {};
            if (this.isFldModified("Width")) { changedFields.Width = true; genEvent = true; }
            if (this.isFldModified("Height")) { changedFields.Height = true; genEvent = true; }
            if (genEvent) {
                $('#ch_' + this.getLid()).trigger("genetix:childPropChanged", {
                    control: this,
                    properties: changedFields
                });
            }
        }
        return vLabel;
    }
);