/**
 * User: kiknadze
 * Date: 13.08.2015
 * Time: 12:59
 */
define(
    ['/scripts/lib/uccello/uses/template.js', 'text!./templates/toolbarButton.html'],
    function(template, tpl) {
        var vButton = {};
        vButton._templates = template.parseTemplate(tpl);
        vButton.render = function(options) {
            var item = $('#' + this.getLid());
            if (item.length == 0) {
                var pItem = $(vButton._templates['button']).attr('id', "mid_" + this.getLid());
                item = pItem.children(".control").attr('id', this.getLid());
                var parent = '#' + (this.getParent()? "ch_"+this.getLid():options.rootContainer);
                $(parent).append(pItem);
                $(parent).css("position", "relative");
            } else {
                pItem = $("#mid_" + this.getLid());
            }

            vButton._genEventsForParent.call(this);
        }

        /**
         * Оповещение парента об изменениях пропертей
         * @private
         */
        vButton._genEventsForParent = function() {
            var genEvent = false;
            var changedFields = {};
            if (this.isFldModified("Width")) { changedFields.Width = true; genEvent = true; }
            if (this.isFldModified("Height")) { changedFields.Height = true; genEvent = true; }
            if (this.isFldModified("HorizontalAlign")) { changedFields.HorizontalAlign = true; genEvent = true; }
            if (this.isFldModified("VerticalAlign")) { changedFields.VerticalAlign = true; genEvent = true; }
            if (this.isFldModified("MinWidth")) { changedFields.MinWidth = true; genEvent = true; }
            if (this.isFldModified("MinHeight")) { changedFields.MinHeight = true; genEvent = true; }
            if (this.isFldModified("MaxWidth")) { changedFields.MaxWidth = true; genEvent = true; }
            if (this.isFldModified("MaxHeight")) { changedFields.MaxHeight = true; genEvent = true; }
            if (this.isFldModified("PadLeft")) { changedFields.PadLeft = true; genEvent = true; }
            if (this.isFldModified("PadRight")) { changedFields.PadRight = true; genEvent = true; }
            if (this.isFldModified("PadTop")) { changedFields.PadTop = true; genEvent = true; }
            if (this.isFldModified("PadBottom")) { changedFields.PadBottom = true; genEvent = true; }

            if (genEvent) {
                $('#ch_' + this.getLid()).trigger("genetix:childPropChanged", {
                    control: this,
                    properties: changedFields
                });
            }
        }
        return vButton;
    }
);