define(
    ['/scripts/lib/uccello/uses/template.js', 'text!./templates/dataEdit.html'],
    function(template, tpl) {
        var vGenDataEdit = {};
        vGenDataEdit._templates = template.parseTemplate(tpl);
        vGenDataEdit.render = function(options) {
            var that = this;
            var item = $('#' + this.getLid());
            if (item.length == 0) {
                if (this.multiline())
                    item = $(vGenDataEdit._templates['multiLineEdit']).attr('id', this.getLid());
                else
                    item = $(vGenDataEdit._templates['edit']).attr('id', this.getLid());
                var parent = this.getParent()? '#ch_' + this.getLid(): options.rootContainer;
                $(parent).append(item);

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
                            $(el).parent().css({height: ""});
                            $(el).parent().height($(el).parent().outerHeight());
                        }
                    }
                });
            }

            item.height(item.height());

        }
        return vGenDataEdit;
    }
);