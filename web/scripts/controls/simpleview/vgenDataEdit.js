define(
    ['/scripts/lib/uccello/uses/template.js', 'text!./templates/dataEdit.html'],
    function(template, tpl) {
        var vGenDataEdit = {};
        vGenDataEdit._templates = template.parseTemplate(tpl);
        vGenDataEdit.render = function(options) {
            var that = this;
            var item = $('#' + this.getLid());
            if (item.length == 0) {
                var pItem = null;
                if (this.multiline())
                    pItem = $(vGenDataEdit._templates['multiLineEdit']).attr('id', "mid_" + this.getLid());
                else
                    pItem = $(vGenDataEdit._templates['edit']).attr('id', "mid_" + this.getLid());
                item = pItem.children(".control").attr('id', this.getLid());

                var parent = this.getParent()? '#ch_' + this.getLid(): options.rootContainer;
                $(parent).append(pItem);

                // сохранять при потере фокуса
                item.blur(function () {
                    if (that.dataset() && that.dataField()) {
                        that.getControlMgr().userEventHandler(that, function () {
                            var dataset = that.getControlMgr().get(that.dataset());
                            dataset.setField(that.dataField(), item.val());
                        });
                    }
                });
            }

            // устанавливаем значение
            if (this.dataset() && this.dataField()) {
                var dataset = that.getControlMgr().get(that.dataset());
                item.val(dataset? dataset.getField(this.dataField()): '');
            }

            if (this.title()) {
                item.attr("title", this.title());
                item.tooltip({
                    position: { my: 'center top', at: 'center bottom', collision: 'none' },
                    tooltipClass: 'bottom'
                });
            } else
                item.removeAttr("title");
            if (this.multiline()) {
                item.children().autosize({
                    callback: function (el) {
                        if ($(el).is(":focus")) {
                            var oldH = $(el).parent().height();
                            $(el).parent().css({height: ""});
                            $(el).parent().parent().css({height: ""});
                            $(el).parent().height($(el).parent().outerHeight());
                            $(el).parent().parent().height($(el).parent().parent().outerHeight());
                            if (oldH != $(el).parent().height())
                                $(window).trigger("genetix:resize");
                        }
                    }
                });
            }

            item.height(item.height());

            vGenDataEdit._genEventsForParent.call(this);
        }

        /**
         * Оповещение парента об изменениях пропертей
         * @private
         */
        vGenDataEdit._genEventsForParent = function() {
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
        return vGenDataEdit;
    }
);